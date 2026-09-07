import request from 'supertest';

interface AssertableResponse {
  text?: string;
}

type AssertCallback = (error: Error | null, response: unknown) => void;

type AssertFn = (
  resError: Error | null,
  res: AssertableResponse | undefined,
  fn?: AssertCallback,
) => void;

interface SupertestModule {
  Test: { prototype: { assert: AssertFn } };
}

const URL_USERINFO_PATTERN = /\/\/([^/\s:@]+):[^/\s@]+@/g;

function redactUrlCredentials(body: string): string {
  return body.replace(URL_USERINFO_PATTERN, '//$1:***@');
}

// V8 bakes the message into the stack at creation and jest prints the stack, so the append must land in both.
const supertestModule = request as unknown as SupertestModule;
const originalAssert = supertestModule.Test.prototype.assert;
supertestModule.Test.prototype.assert = function enrichedAssert(
  resError,
  res,
  fn,
) {
  originalAssert.call(this, resError, res, (error, response) => {
    if (error && res?.text !== undefined && res.text !== '') {
      const originalMessage = error.message;
      const body = redactUrlCredentials(res.text.slice(0, 1000));
      error.message = `${originalMessage}\nresponse body: ${body}`;
      if (typeof error.stack === 'string') {
        error.stack = error.stack.replace(originalMessage, error.message);
      }
    }
    if (fn) {
      fn(error, response);
    }
  });
};

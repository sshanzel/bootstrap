# Backlog

Intended foundation work that is not built yet. Items here are candidates for the starter, not commitments.

## Response validation: `ZodSerializerInterceptor` + `@ZodResponse`

Controllers return values without validating them against a Zod schema on the way out; any `.parse()` on a response is hand-written today. Add an interceptor that validates outgoing responses automatically, mirroring the request-side `ZodBody`/`ZodParam`/`ZodQuery` so both directions of the contract are enforced by the same schemas.

- Add `@ZodResponse(schema)`, a `SetMetadata` decorator that declares the response schema on a handler.
- Add `ZodSerializerInterceptor` that, in its `map()`, reads that metadata and runs the handler's return value through `schema.parse()`, so the response is validated and unknown keys are stripped before it leaves the API.
- Wire it in `apps/api/src/app.setup.ts` alongside the request-side validation pipe and the exception filter, and keep the files with the request-side pieces in `apps/api/src/common/zod/`.
- A parse failure is a server bug (the handler produced a shape it promised not to), so surface it as a 500 through `ApiExceptionFilter`, not a 400.
- Cover it with an integration spec: a handler whose real output violates its `@ZodResponse` schema returns 500, and a valid handler round-trips unchanged with extra keys stripped.

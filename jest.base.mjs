// The one swc transform every jest config shares; decorators stay on
// everywhere so Nest services and TypeORM entities ride one pipeline.
export const swcTransform = {
  '^.+\\.ts$': [
    '@swc/jest',
    {
      jsc: {
        parser: {
          syntax: 'typescript',
          decorators: true,
        },
        transform: {
          legacyDecorator: true,
          decoratorMetadata: true,
        },
      },
    },
  ],
};

import { GraphQLScalarType, Kind, ValueNode } from 'graphql';
import { isValid, isDate } from 'date-fns';

const isValidDateTime = (value: unknown): boolean => {
  const isSerializable =
    isDate(value) || typeof value === 'string' || typeof value === 'number';

  return isSerializable ? isValid(new Date(value as string | number | Date)) : false;
};

const config = {
  name: 'DateTime',
  description:
    'A date-time string at UTC, such as 2007-12-03T10:15:30Z, ' +
    'compliant with the `date-time` format outlined in section 5.6 of ' +
    'the RFC 3339 profile of the ISO 8601 standard for representation ' +
    'of dates and times using the Gregorian calendar.',
  serialize(value: unknown): string {
    if (isValidDateTime(value)) {
      return new Date(value as string | number | Date).toISOString();
    }

    throw new TypeError(
      `DateTime can not be serialized from ${JSON.stringify(value)}`
    );
  },
  parseValue(value: unknown): Date {
    if (isValidDateTime(value)) {
      return new Date(value as string | number | Date);
    }

    throw new TypeError(
      `DateTime can not be parsed from ${JSON.stringify(value)}`
    );
  },
  parseLiteral(ast: ValueNode): Date {
    if (ast.kind !== Kind.STRING) {
      throw new TypeError(
        `DateTime cannot represent non string type ${ast.kind}`
      );
    }

    const { value } = ast;

    if (value && isValidDateTime(value)) {
      return new Date(value);
    }

    throw new TypeError(
      `DateTime can not be parsed from ${JSON.stringify(value)}`
    );
  },
};

export const resolvers = {
  DateTime: new GraphQLScalarType(config),
};

export const typeDefs = `#graphql
  scalar DateTime
`;

export default {
  resolvers,
  typeDefs,
};

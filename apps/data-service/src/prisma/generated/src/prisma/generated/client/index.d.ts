
/**
 * Client
**/

import * as runtime from './runtime/library.js';
import $Types = runtime.Types // general types
import $Public = runtime.Types.Public
import $Utils = runtime.Types.Utils
import $Extensions = runtime.Types.Extensions
import $Result = runtime.Types.Result

export type PrismaPromise<T> = $Public.PrismaPromise<T>


/**
 * Model CmsCollection
 * 
 */
export type CmsCollection = $Result.DefaultSelection<Prisma.$CmsCollectionPayload>
/**
 * Model CmsRecord
 * 
 */
export type CmsRecord = $Result.DefaultSelection<Prisma.$CmsRecordPayload>

/**
 * ##  Prisma Client ʲˢ
 *
 * Type-safe database client for TypeScript & Node.js
 * @example
 * ```
 * const prisma = new PrismaClient()
 * // Fetch zero or more CmsCollections
 * const cmsCollections = await prisma.cmsCollection.findMany()
 * ```
 *
 *
 * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
 */
export class PrismaClient<
  ClientOptions extends Prisma.PrismaClientOptions = Prisma.PrismaClientOptions,
  const U = 'log' extends keyof ClientOptions ? ClientOptions['log'] extends Array<Prisma.LogLevel | Prisma.LogDefinition> ? Prisma.GetEvents<ClientOptions['log']> : never : never,
  ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs
> {
  [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['other'] }

    /**
   * ##  Prisma Client ʲˢ
   *
   * Type-safe database client for TypeScript & Node.js
   * @example
   * ```
   * const prisma = new PrismaClient()
   * // Fetch zero or more CmsCollections
   * const cmsCollections = await prisma.cmsCollection.findMany()
   * ```
   *
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
   */

  constructor(optionsArg ?: Prisma.Subset<ClientOptions, Prisma.PrismaClientOptions>);
  $on<V extends U>(eventType: V, callback: (event: V extends 'query' ? Prisma.QueryEvent : Prisma.LogEvent) => void): PrismaClient;

  /**
   * Connect with the database
   */
  $connect(): $Utils.JsPromise<void>;

  /**
   * Disconnect from the database
   */
  $disconnect(): $Utils.JsPromise<void>;

/**
   * Executes a prepared raw query and returns the number of affected rows.
   * @example
   * ```
   * const result = await prisma.$executeRaw`UPDATE User SET cool = ${true} WHERE email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Executes a raw query and returns the number of affected rows.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$executeRawUnsafe('UPDATE User SET cool = $1 WHERE email = $2 ;', true, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Performs a prepared raw query and returns the `SELECT` data.
   * @example
   * ```
   * const result = await prisma.$queryRaw`SELECT * FROM User WHERE id = ${1} OR email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<T>;

  /**
   * Performs a raw query and returns the `SELECT` data.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$queryRawUnsafe('SELECT * FROM User WHERE id = $1 OR email = $2;', 1, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<T>;


  /**
   * Allows the running of a sequence of read/write operations that are guaranteed to either succeed or fail as a whole.
   * @example
   * ```
   * const [george, bob, alice] = await prisma.$transaction([
   *   prisma.user.create({ data: { name: 'George' } }),
   *   prisma.user.create({ data: { name: 'Bob' } }),
   *   prisma.user.create({ data: { name: 'Alice' } }),
   * ])
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/concepts/components/prisma-client/transactions).
   */
  $transaction<P extends Prisma.PrismaPromise<any>[]>(arg: [...P], options?: { isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<runtime.Types.Utils.UnwrapTuple<P>>

  $transaction<R>(fn: (prisma: Omit<PrismaClient, runtime.ITXClientDenyList>) => $Utils.JsPromise<R>, options?: { maxWait?: number, timeout?: number, isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<R>


  $extends: $Extensions.ExtendsHook<"extends", Prisma.TypeMapCb<ClientOptions>, ExtArgs, $Utils.Call<Prisma.TypeMapCb<ClientOptions>, {
    extArgs: ExtArgs
  }>>

      /**
   * `prisma.cmsCollection`: Exposes CRUD operations for the **CmsCollection** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more CmsCollections
    * const cmsCollections = await prisma.cmsCollection.findMany()
    * ```
    */
  get cmsCollection(): Prisma.CmsCollectionDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.cmsRecord`: Exposes CRUD operations for the **CmsRecord** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more CmsRecords
    * const cmsRecords = await prisma.cmsRecord.findMany()
    * ```
    */
  get cmsRecord(): Prisma.CmsRecordDelegate<ExtArgs, ClientOptions>;
}

export namespace Prisma {
  export import DMMF = runtime.DMMF

  export type PrismaPromise<T> = $Public.PrismaPromise<T>

  /**
   * Validator
   */
  export import validator = runtime.Public.validator

  /**
   * Prisma Errors
   */
  export import PrismaClientKnownRequestError = runtime.PrismaClientKnownRequestError
  export import PrismaClientUnknownRequestError = runtime.PrismaClientUnknownRequestError
  export import PrismaClientRustPanicError = runtime.PrismaClientRustPanicError
  export import PrismaClientInitializationError = runtime.PrismaClientInitializationError
  export import PrismaClientValidationError = runtime.PrismaClientValidationError

  /**
   * Re-export of sql-template-tag
   */
  export import sql = runtime.sqltag
  export import empty = runtime.empty
  export import join = runtime.join
  export import raw = runtime.raw
  export import Sql = runtime.Sql



  /**
   * Decimal.js
   */
  export import Decimal = runtime.Decimal

  export type DecimalJsLike = runtime.DecimalJsLike

  /**
   * Metrics
   */
  export type Metrics = runtime.Metrics
  export type Metric<T> = runtime.Metric<T>
  export type MetricHistogram = runtime.MetricHistogram
  export type MetricHistogramBucket = runtime.MetricHistogramBucket

  /**
  * Extensions
  */
  export import Extension = $Extensions.UserArgs
  export import getExtensionContext = runtime.Extensions.getExtensionContext
  export import Args = $Public.Args
  export import Payload = $Public.Payload
  export import Result = $Public.Result
  export import Exact = $Public.Exact

  /**
   * Prisma Client JS version: 6.19.3
   * Query Engine version: c2990dca591cba766e3b7ef5d9e8a84796e47ab7
   */
  export type PrismaVersion = {
    client: string
  }

  export const prismaVersion: PrismaVersion

  /**
   * Utility Types
   */


  export import Bytes = runtime.Bytes
  export import JsonObject = runtime.JsonObject
  export import JsonArray = runtime.JsonArray
  export import JsonValue = runtime.JsonValue
  export import InputJsonObject = runtime.InputJsonObject
  export import InputJsonArray = runtime.InputJsonArray
  export import InputJsonValue = runtime.InputJsonValue

  /**
   * Types of the values used to represent different kinds of `null` values when working with JSON fields.
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  namespace NullTypes {
    /**
    * Type of `Prisma.DbNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.DbNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class DbNull {
      private DbNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.JsonNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.JsonNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class JsonNull {
      private JsonNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.AnyNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.AnyNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class AnyNull {
      private AnyNull: never
      private constructor()
    }
  }

  /**
   * Helper for filtering JSON entries that have `null` on the database (empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const DbNull: NullTypes.DbNull

  /**
   * Helper for filtering JSON entries that have JSON `null` values (not empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const JsonNull: NullTypes.JsonNull

  /**
   * Helper for filtering JSON entries that are `Prisma.DbNull` or `Prisma.JsonNull`
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const AnyNull: NullTypes.AnyNull

  type SelectAndInclude = {
    select: any
    include: any
  }

  type SelectAndOmit = {
    select: any
    omit: any
  }

  /**
   * Get the type of the value, that the Promise holds.
   */
  export type PromiseType<T extends PromiseLike<any>> = T extends PromiseLike<infer U> ? U : T;

  /**
   * Get the return type of a function which returns a Promise.
   */
  export type PromiseReturnType<T extends (...args: any) => $Utils.JsPromise<any>> = PromiseType<ReturnType<T>>

  /**
   * From T, pick a set of properties whose keys are in the union K
   */
  type Prisma__Pick<T, K extends keyof T> = {
      [P in K]: T[P];
  };


  export type Enumerable<T> = T | Array<T>;

  export type RequiredKeys<T> = {
    [K in keyof T]-?: {} extends Prisma__Pick<T, K> ? never : K
  }[keyof T]

  export type TruthyKeys<T> = keyof {
    [K in keyof T as T[K] extends false | undefined | null ? never : K]: K
  }

  export type TrueKeys<T> = TruthyKeys<Prisma__Pick<T, RequiredKeys<T>>>

  /**
   * Subset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection
   */
  export type Subset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never;
  };

  /**
   * SelectSubset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection.
   * Additionally, it validates, if both select and include are present. If the case, it errors.
   */
  export type SelectSubset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    (T extends SelectAndInclude
      ? 'Please either choose `select` or `include`.'
      : T extends SelectAndOmit
        ? 'Please either choose `select` or `omit`.'
        : {})

  /**
   * Subset + Intersection
   * @desc From `T` pick properties that exist in `U` and intersect `K`
   */
  export type SubsetIntersection<T, U, K> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    K

  type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never };

  /**
   * XOR is needed to have a real mutually exclusive union type
   * https://stackoverflow.com/questions/42123407/does-typescript-support-mutually-exclusive-types
   */
  type XOR<T, U> =
    T extends object ?
    U extends object ?
      (Without<T, U> & U) | (Without<U, T> & T)
    : U : T


  /**
   * Is T a Record?
   */
  type IsObject<T extends any> = T extends Array<any>
  ? False
  : T extends Date
  ? False
  : T extends Uint8Array
  ? False
  : T extends BigInt
  ? False
  : T extends object
  ? True
  : False


  /**
   * If it's T[], return T
   */
  export type UnEnumerate<T extends unknown> = T extends Array<infer U> ? U : T

  /**
   * From ts-toolbelt
   */

  type __Either<O extends object, K extends Key> = Omit<O, K> &
    {
      // Merge all but K
      [P in K]: Prisma__Pick<O, P & keyof O> // With K possibilities
    }[K]

  type EitherStrict<O extends object, K extends Key> = Strict<__Either<O, K>>

  type EitherLoose<O extends object, K extends Key> = ComputeRaw<__Either<O, K>>

  type _Either<
    O extends object,
    K extends Key,
    strict extends Boolean
  > = {
    1: EitherStrict<O, K>
    0: EitherLoose<O, K>
  }[strict]

  type Either<
    O extends object,
    K extends Key,
    strict extends Boolean = 1
  > = O extends unknown ? _Either<O, K, strict> : never

  export type Union = any

  type PatchUndefined<O extends object, O1 extends object> = {
    [K in keyof O]: O[K] extends undefined ? At<O1, K> : O[K]
  } & {}

  /** Helper Types for "Merge" **/
  export type IntersectOf<U extends Union> = (
    U extends unknown ? (k: U) => void : never
  ) extends (k: infer I) => void
    ? I
    : never

  export type Overwrite<O extends object, O1 extends object> = {
      [K in keyof O]: K extends keyof O1 ? O1[K] : O[K];
  } & {};

  type _Merge<U extends object> = IntersectOf<Overwrite<U, {
      [K in keyof U]-?: At<U, K>;
  }>>;

  type Key = string | number | symbol;
  type AtBasic<O extends object, K extends Key> = K extends keyof O ? O[K] : never;
  type AtStrict<O extends object, K extends Key> = O[K & keyof O];
  type AtLoose<O extends object, K extends Key> = O extends unknown ? AtStrict<O, K> : never;
  export type At<O extends object, K extends Key, strict extends Boolean = 1> = {
      1: AtStrict<O, K>;
      0: AtLoose<O, K>;
  }[strict];

  export type ComputeRaw<A extends any> = A extends Function ? A : {
    [K in keyof A]: A[K];
  } & {};

  export type OptionalFlat<O> = {
    [K in keyof O]?: O[K];
  } & {};

  type _Record<K extends keyof any, T> = {
    [P in K]: T;
  };

  // cause typescript not to expand types and preserve names
  type NoExpand<T> = T extends unknown ? T : never;

  // this type assumes the passed object is entirely optional
  type AtLeast<O extends object, K extends string> = NoExpand<
    O extends unknown
    ? | (K extends keyof O ? { [P in K]: O[P] } & O : O)
      | {[P in keyof O as P extends K ? P : never]-?: O[P]} & O
    : never>;

  type _Strict<U, _U = U> = U extends unknown ? U & OptionalFlat<_Record<Exclude<Keys<_U>, keyof U>, never>> : never;

  export type Strict<U extends object> = ComputeRaw<_Strict<U>>;
  /** End Helper Types for "Merge" **/

  export type Merge<U extends object> = ComputeRaw<_Merge<Strict<U>>>;

  /**
  A [[Boolean]]
  */
  export type Boolean = True | False

  // /**
  // 1
  // */
  export type True = 1

  /**
  0
  */
  export type False = 0

  export type Not<B extends Boolean> = {
    0: 1
    1: 0
  }[B]

  export type Extends<A1 extends any, A2 extends any> = [A1] extends [never]
    ? 0 // anything `never` is false
    : A1 extends A2
    ? 1
    : 0

  export type Has<U extends Union, U1 extends Union> = Not<
    Extends<Exclude<U1, U>, U1>
  >

  export type Or<B1 extends Boolean, B2 extends Boolean> = {
    0: {
      0: 0
      1: 1
    }
    1: {
      0: 1
      1: 1
    }
  }[B1][B2]

  export type Keys<U extends Union> = U extends unknown ? keyof U : never

  type Cast<A, B> = A extends B ? A : B;

  export const type: unique symbol;



  /**
   * Used by group by
   */

  export type GetScalarType<T, O> = O extends object ? {
    [P in keyof T]: P extends keyof O
      ? O[P]
      : never
  } : never

  type FieldPaths<
    T,
    U = Omit<T, '_avg' | '_sum' | '_count' | '_min' | '_max'>
  > = IsObject<T> extends True ? U : T

  type GetHavingFields<T> = {
    [K in keyof T]: Or<
      Or<Extends<'OR', K>, Extends<'AND', K>>,
      Extends<'NOT', K>
    > extends True
      ? // infer is only needed to not hit TS limit
        // based on the brilliant idea of Pierre-Antoine Mills
        // https://github.com/microsoft/TypeScript/issues/30188#issuecomment-478938437
        T[K] extends infer TK
        ? GetHavingFields<UnEnumerate<TK> extends object ? Merge<UnEnumerate<TK>> : never>
        : never
      : {} extends FieldPaths<T[K]>
      ? never
      : K
  }[keyof T]

  /**
   * Convert tuple to union
   */
  type _TupleToUnion<T> = T extends (infer E)[] ? E : never
  type TupleToUnion<K extends readonly any[]> = _TupleToUnion<K>
  type MaybeTupleToUnion<T> = T extends any[] ? TupleToUnion<T> : T

  /**
   * Like `Pick`, but additionally can also accept an array of keys
   */
  type PickEnumerable<T, K extends Enumerable<keyof T> | keyof T> = Prisma__Pick<T, MaybeTupleToUnion<K>>

  /**
   * Exclude all keys with underscores
   */
  type ExcludeUnderscoreKeys<T extends string> = T extends `_${string}` ? never : T


  export type FieldRef<Model, FieldType> = runtime.FieldRef<Model, FieldType>

  type FieldRefInputType<Model, FieldType> = Model extends never ? never : FieldRef<Model, FieldType>


  export const ModelName: {
    CmsCollection: 'CmsCollection',
    CmsRecord: 'CmsRecord'
  };

  export type ModelName = (typeof ModelName)[keyof typeof ModelName]


  export type Datasources = {
    db?: Datasource
  }

  interface TypeMapCb<ClientOptions = {}> extends $Utils.Fn<{extArgs: $Extensions.InternalArgs }, $Utils.Record<string, any>> {
    returns: Prisma.TypeMap<this['params']['extArgs'], ClientOptions extends { omit: infer OmitOptions } ? OmitOptions : {}>
  }

  export type TypeMap<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> = {
    globalOmitOptions: {
      omit: GlobalOmitOptions
    }
    meta: {
      modelProps: "cmsCollection" | "cmsRecord"
      txIsolationLevel: Prisma.TransactionIsolationLevel
    }
    model: {
      CmsCollection: {
        payload: Prisma.$CmsCollectionPayload<ExtArgs>
        fields: Prisma.CmsCollectionFieldRefs
        operations: {
          findUnique: {
            args: Prisma.CmsCollectionFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CmsCollectionPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.CmsCollectionFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CmsCollectionPayload>
          }
          findFirst: {
            args: Prisma.CmsCollectionFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CmsCollectionPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.CmsCollectionFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CmsCollectionPayload>
          }
          findMany: {
            args: Prisma.CmsCollectionFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CmsCollectionPayload>[]
          }
          create: {
            args: Prisma.CmsCollectionCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CmsCollectionPayload>
          }
          createMany: {
            args: Prisma.CmsCollectionCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.CmsCollectionCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CmsCollectionPayload>[]
          }
          delete: {
            args: Prisma.CmsCollectionDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CmsCollectionPayload>
          }
          update: {
            args: Prisma.CmsCollectionUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CmsCollectionPayload>
          }
          deleteMany: {
            args: Prisma.CmsCollectionDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.CmsCollectionUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.CmsCollectionUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CmsCollectionPayload>[]
          }
          upsert: {
            args: Prisma.CmsCollectionUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CmsCollectionPayload>
          }
          aggregate: {
            args: Prisma.CmsCollectionAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateCmsCollection>
          }
          groupBy: {
            args: Prisma.CmsCollectionGroupByArgs<ExtArgs>
            result: $Utils.Optional<CmsCollectionGroupByOutputType>[]
          }
          count: {
            args: Prisma.CmsCollectionCountArgs<ExtArgs>
            result: $Utils.Optional<CmsCollectionCountAggregateOutputType> | number
          }
        }
      }
      CmsRecord: {
        payload: Prisma.$CmsRecordPayload<ExtArgs>
        fields: Prisma.CmsRecordFieldRefs
        operations: {
          findUnique: {
            args: Prisma.CmsRecordFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CmsRecordPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.CmsRecordFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CmsRecordPayload>
          }
          findFirst: {
            args: Prisma.CmsRecordFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CmsRecordPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.CmsRecordFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CmsRecordPayload>
          }
          findMany: {
            args: Prisma.CmsRecordFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CmsRecordPayload>[]
          }
          create: {
            args: Prisma.CmsRecordCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CmsRecordPayload>
          }
          createMany: {
            args: Prisma.CmsRecordCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.CmsRecordCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CmsRecordPayload>[]
          }
          delete: {
            args: Prisma.CmsRecordDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CmsRecordPayload>
          }
          update: {
            args: Prisma.CmsRecordUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CmsRecordPayload>
          }
          deleteMany: {
            args: Prisma.CmsRecordDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.CmsRecordUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.CmsRecordUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CmsRecordPayload>[]
          }
          upsert: {
            args: Prisma.CmsRecordUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CmsRecordPayload>
          }
          aggregate: {
            args: Prisma.CmsRecordAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateCmsRecord>
          }
          groupBy: {
            args: Prisma.CmsRecordGroupByArgs<ExtArgs>
            result: $Utils.Optional<CmsRecordGroupByOutputType>[]
          }
          count: {
            args: Prisma.CmsRecordCountArgs<ExtArgs>
            result: $Utils.Optional<CmsRecordCountAggregateOutputType> | number
          }
        }
      }
    }
  } & {
    other: {
      payload: any
      operations: {
        $executeRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $executeRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
        $queryRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $queryRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
      }
    }
  }
  export const defineExtension: $Extensions.ExtendsHook<"define", Prisma.TypeMapCb, $Extensions.DefaultArgs>
  export type DefaultPrismaClient = PrismaClient
  export type ErrorFormat = 'pretty' | 'colorless' | 'minimal'
  export interface PrismaClientOptions {
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasources?: Datasources
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasourceUrl?: string
    /**
     * @default "colorless"
     */
    errorFormat?: ErrorFormat
    /**
     * @example
     * ```
     * // Shorthand for `emit: 'stdout'`
     * log: ['query', 'info', 'warn', 'error']
     * 
     * // Emit as events only
     * log: [
     *   { emit: 'event', level: 'query' },
     *   { emit: 'event', level: 'info' },
     *   { emit: 'event', level: 'warn' }
     *   { emit: 'event', level: 'error' }
     * ]
     * 
     * / Emit as events and log to stdout
     * og: [
     *  { emit: 'stdout', level: 'query' },
     *  { emit: 'stdout', level: 'info' },
     *  { emit: 'stdout', level: 'warn' }
     *  { emit: 'stdout', level: 'error' }
     * 
     * ```
     * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/logging#the-log-option).
     */
    log?: (LogLevel | LogDefinition)[]
    /**
     * The default values for transactionOptions
     * maxWait ?= 2000
     * timeout ?= 5000
     */
    transactionOptions?: {
      maxWait?: number
      timeout?: number
      isolationLevel?: Prisma.TransactionIsolationLevel
    }
    /**
     * Instance of a Driver Adapter, e.g., like one provided by `@prisma/adapter-planetscale`
     */
    adapter?: runtime.SqlDriverAdapterFactory | null
    /**
     * Global configuration for omitting model fields by default.
     * 
     * @example
     * ```
     * const prisma = new PrismaClient({
     *   omit: {
     *     user: {
     *       password: true
     *     }
     *   }
     * })
     * ```
     */
    omit?: Prisma.GlobalOmitConfig
  }
  export type GlobalOmitConfig = {
    cmsCollection?: CmsCollectionOmit
    cmsRecord?: CmsRecordOmit
  }

  /* Types for Logging */
  export type LogLevel = 'info' | 'query' | 'warn' | 'error'
  export type LogDefinition = {
    level: LogLevel
    emit: 'stdout' | 'event'
  }

  export type CheckIsLogLevel<T> = T extends LogLevel ? T : never;

  export type GetLogType<T> = CheckIsLogLevel<
    T extends LogDefinition ? T['level'] : T
  >;

  export type GetEvents<T extends any[]> = T extends Array<LogLevel | LogDefinition>
    ? GetLogType<T[number]>
    : never;

  export type QueryEvent = {
    timestamp: Date
    query: string
    params: string
    duration: number
    target: string
  }

  export type LogEvent = {
    timestamp: Date
    message: string
    target: string
  }
  /* End Types for Logging */


  export type PrismaAction =
    | 'findUnique'
    | 'findUniqueOrThrow'
    | 'findMany'
    | 'findFirst'
    | 'findFirstOrThrow'
    | 'create'
    | 'createMany'
    | 'createManyAndReturn'
    | 'update'
    | 'updateMany'
    | 'updateManyAndReturn'
    | 'upsert'
    | 'delete'
    | 'deleteMany'
    | 'executeRaw'
    | 'queryRaw'
    | 'aggregate'
    | 'count'
    | 'runCommandRaw'
    | 'findRaw'
    | 'groupBy'

  // tested in getLogLevel.test.ts
  export function getLogLevel(log: Array<LogLevel | LogDefinition>): LogLevel | undefined;

  /**
   * `PrismaClient` proxy available in interactive transactions.
   */
  export type TransactionClient = Omit<Prisma.DefaultPrismaClient, runtime.ITXClientDenyList>

  export type Datasource = {
    url?: string
  }

  /**
   * Count Types
   */


  /**
   * Count Type CmsCollectionCountOutputType
   */

  export type CmsCollectionCountOutputType = {
    records: number
  }

  export type CmsCollectionCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    records?: boolean | CmsCollectionCountOutputTypeCountRecordsArgs
  }

  // Custom InputTypes
  /**
   * CmsCollectionCountOutputType without action
   */
  export type CmsCollectionCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CmsCollectionCountOutputType
     */
    select?: CmsCollectionCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * CmsCollectionCountOutputType without action
   */
  export type CmsCollectionCountOutputTypeCountRecordsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: CmsRecordWhereInput
  }


  /**
   * Models
   */

  /**
   * Model CmsCollection
   */

  export type AggregateCmsCollection = {
    _count: CmsCollectionCountAggregateOutputType | null
    _min: CmsCollectionMinAggregateOutputType | null
    _max: CmsCollectionMaxAggregateOutputType | null
  }

  export type CmsCollectionMinAggregateOutputType = {
    id: string | null
    siteId: string | null
    name: string | null
    slug: string | null
    description: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type CmsCollectionMaxAggregateOutputType = {
    id: string | null
    siteId: string | null
    name: string | null
    slug: string | null
    description: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type CmsCollectionCountAggregateOutputType = {
    id: number
    siteId: number
    name: number
    slug: number
    description: number
    schemaDefinition: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type CmsCollectionMinAggregateInputType = {
    id?: true
    siteId?: true
    name?: true
    slug?: true
    description?: true
    createdAt?: true
    updatedAt?: true
  }

  export type CmsCollectionMaxAggregateInputType = {
    id?: true
    siteId?: true
    name?: true
    slug?: true
    description?: true
    createdAt?: true
    updatedAt?: true
  }

  export type CmsCollectionCountAggregateInputType = {
    id?: true
    siteId?: true
    name?: true
    slug?: true
    description?: true
    schemaDefinition?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type CmsCollectionAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which CmsCollection to aggregate.
     */
    where?: CmsCollectionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of CmsCollections to fetch.
     */
    orderBy?: CmsCollectionOrderByWithRelationInput | CmsCollectionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: CmsCollectionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` CmsCollections from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` CmsCollections.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned CmsCollections
    **/
    _count?: true | CmsCollectionCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: CmsCollectionMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: CmsCollectionMaxAggregateInputType
  }

  export type GetCmsCollectionAggregateType<T extends CmsCollectionAggregateArgs> = {
        [P in keyof T & keyof AggregateCmsCollection]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateCmsCollection[P]>
      : GetScalarType<T[P], AggregateCmsCollection[P]>
  }




  export type CmsCollectionGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: CmsCollectionWhereInput
    orderBy?: CmsCollectionOrderByWithAggregationInput | CmsCollectionOrderByWithAggregationInput[]
    by: CmsCollectionScalarFieldEnum[] | CmsCollectionScalarFieldEnum
    having?: CmsCollectionScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: CmsCollectionCountAggregateInputType | true
    _min?: CmsCollectionMinAggregateInputType
    _max?: CmsCollectionMaxAggregateInputType
  }

  export type CmsCollectionGroupByOutputType = {
    id: string
    siteId: string
    name: string
    slug: string
    description: string | null
    schemaDefinition: JsonValue
    createdAt: Date
    updatedAt: Date
    _count: CmsCollectionCountAggregateOutputType | null
    _min: CmsCollectionMinAggregateOutputType | null
    _max: CmsCollectionMaxAggregateOutputType | null
  }

  type GetCmsCollectionGroupByPayload<T extends CmsCollectionGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<CmsCollectionGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof CmsCollectionGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], CmsCollectionGroupByOutputType[P]>
            : GetScalarType<T[P], CmsCollectionGroupByOutputType[P]>
        }
      >
    >


  export type CmsCollectionSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    siteId?: boolean
    name?: boolean
    slug?: boolean
    description?: boolean
    schemaDefinition?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    records?: boolean | CmsCollection$recordsArgs<ExtArgs>
    _count?: boolean | CmsCollectionCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["cmsCollection"]>

  export type CmsCollectionSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    siteId?: boolean
    name?: boolean
    slug?: boolean
    description?: boolean
    schemaDefinition?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["cmsCollection"]>

  export type CmsCollectionSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    siteId?: boolean
    name?: boolean
    slug?: boolean
    description?: boolean
    schemaDefinition?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["cmsCollection"]>

  export type CmsCollectionSelectScalar = {
    id?: boolean
    siteId?: boolean
    name?: boolean
    slug?: boolean
    description?: boolean
    schemaDefinition?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type CmsCollectionOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "siteId" | "name" | "slug" | "description" | "schemaDefinition" | "createdAt" | "updatedAt", ExtArgs["result"]["cmsCollection"]>
  export type CmsCollectionInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    records?: boolean | CmsCollection$recordsArgs<ExtArgs>
    _count?: boolean | CmsCollectionCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type CmsCollectionIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}
  export type CmsCollectionIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $CmsCollectionPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "CmsCollection"
    objects: {
      records: Prisma.$CmsRecordPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      siteId: string
      name: string
      slug: string
      description: string | null
      schemaDefinition: Prisma.JsonValue
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["cmsCollection"]>
    composites: {}
  }

  type CmsCollectionGetPayload<S extends boolean | null | undefined | CmsCollectionDefaultArgs> = $Result.GetResult<Prisma.$CmsCollectionPayload, S>

  type CmsCollectionCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<CmsCollectionFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: CmsCollectionCountAggregateInputType | true
    }

  export interface CmsCollectionDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['CmsCollection'], meta: { name: 'CmsCollection' } }
    /**
     * Find zero or one CmsCollection that matches the filter.
     * @param {CmsCollectionFindUniqueArgs} args - Arguments to find a CmsCollection
     * @example
     * // Get one CmsCollection
     * const cmsCollection = await prisma.cmsCollection.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends CmsCollectionFindUniqueArgs>(args: SelectSubset<T, CmsCollectionFindUniqueArgs<ExtArgs>>): Prisma__CmsCollectionClient<$Result.GetResult<Prisma.$CmsCollectionPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one CmsCollection that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {CmsCollectionFindUniqueOrThrowArgs} args - Arguments to find a CmsCollection
     * @example
     * // Get one CmsCollection
     * const cmsCollection = await prisma.cmsCollection.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends CmsCollectionFindUniqueOrThrowArgs>(args: SelectSubset<T, CmsCollectionFindUniqueOrThrowArgs<ExtArgs>>): Prisma__CmsCollectionClient<$Result.GetResult<Prisma.$CmsCollectionPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first CmsCollection that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CmsCollectionFindFirstArgs} args - Arguments to find a CmsCollection
     * @example
     * // Get one CmsCollection
     * const cmsCollection = await prisma.cmsCollection.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends CmsCollectionFindFirstArgs>(args?: SelectSubset<T, CmsCollectionFindFirstArgs<ExtArgs>>): Prisma__CmsCollectionClient<$Result.GetResult<Prisma.$CmsCollectionPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first CmsCollection that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CmsCollectionFindFirstOrThrowArgs} args - Arguments to find a CmsCollection
     * @example
     * // Get one CmsCollection
     * const cmsCollection = await prisma.cmsCollection.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends CmsCollectionFindFirstOrThrowArgs>(args?: SelectSubset<T, CmsCollectionFindFirstOrThrowArgs<ExtArgs>>): Prisma__CmsCollectionClient<$Result.GetResult<Prisma.$CmsCollectionPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more CmsCollections that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CmsCollectionFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all CmsCollections
     * const cmsCollections = await prisma.cmsCollection.findMany()
     * 
     * // Get first 10 CmsCollections
     * const cmsCollections = await prisma.cmsCollection.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const cmsCollectionWithIdOnly = await prisma.cmsCollection.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends CmsCollectionFindManyArgs>(args?: SelectSubset<T, CmsCollectionFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CmsCollectionPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a CmsCollection.
     * @param {CmsCollectionCreateArgs} args - Arguments to create a CmsCollection.
     * @example
     * // Create one CmsCollection
     * const CmsCollection = await prisma.cmsCollection.create({
     *   data: {
     *     // ... data to create a CmsCollection
     *   }
     * })
     * 
     */
    create<T extends CmsCollectionCreateArgs>(args: SelectSubset<T, CmsCollectionCreateArgs<ExtArgs>>): Prisma__CmsCollectionClient<$Result.GetResult<Prisma.$CmsCollectionPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many CmsCollections.
     * @param {CmsCollectionCreateManyArgs} args - Arguments to create many CmsCollections.
     * @example
     * // Create many CmsCollections
     * const cmsCollection = await prisma.cmsCollection.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends CmsCollectionCreateManyArgs>(args?: SelectSubset<T, CmsCollectionCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many CmsCollections and returns the data saved in the database.
     * @param {CmsCollectionCreateManyAndReturnArgs} args - Arguments to create many CmsCollections.
     * @example
     * // Create many CmsCollections
     * const cmsCollection = await prisma.cmsCollection.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many CmsCollections and only return the `id`
     * const cmsCollectionWithIdOnly = await prisma.cmsCollection.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends CmsCollectionCreateManyAndReturnArgs>(args?: SelectSubset<T, CmsCollectionCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CmsCollectionPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a CmsCollection.
     * @param {CmsCollectionDeleteArgs} args - Arguments to delete one CmsCollection.
     * @example
     * // Delete one CmsCollection
     * const CmsCollection = await prisma.cmsCollection.delete({
     *   where: {
     *     // ... filter to delete one CmsCollection
     *   }
     * })
     * 
     */
    delete<T extends CmsCollectionDeleteArgs>(args: SelectSubset<T, CmsCollectionDeleteArgs<ExtArgs>>): Prisma__CmsCollectionClient<$Result.GetResult<Prisma.$CmsCollectionPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one CmsCollection.
     * @param {CmsCollectionUpdateArgs} args - Arguments to update one CmsCollection.
     * @example
     * // Update one CmsCollection
     * const cmsCollection = await prisma.cmsCollection.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends CmsCollectionUpdateArgs>(args: SelectSubset<T, CmsCollectionUpdateArgs<ExtArgs>>): Prisma__CmsCollectionClient<$Result.GetResult<Prisma.$CmsCollectionPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more CmsCollections.
     * @param {CmsCollectionDeleteManyArgs} args - Arguments to filter CmsCollections to delete.
     * @example
     * // Delete a few CmsCollections
     * const { count } = await prisma.cmsCollection.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends CmsCollectionDeleteManyArgs>(args?: SelectSubset<T, CmsCollectionDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more CmsCollections.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CmsCollectionUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many CmsCollections
     * const cmsCollection = await prisma.cmsCollection.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends CmsCollectionUpdateManyArgs>(args: SelectSubset<T, CmsCollectionUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more CmsCollections and returns the data updated in the database.
     * @param {CmsCollectionUpdateManyAndReturnArgs} args - Arguments to update many CmsCollections.
     * @example
     * // Update many CmsCollections
     * const cmsCollection = await prisma.cmsCollection.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more CmsCollections and only return the `id`
     * const cmsCollectionWithIdOnly = await prisma.cmsCollection.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends CmsCollectionUpdateManyAndReturnArgs>(args: SelectSubset<T, CmsCollectionUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CmsCollectionPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one CmsCollection.
     * @param {CmsCollectionUpsertArgs} args - Arguments to update or create a CmsCollection.
     * @example
     * // Update or create a CmsCollection
     * const cmsCollection = await prisma.cmsCollection.upsert({
     *   create: {
     *     // ... data to create a CmsCollection
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the CmsCollection we want to update
     *   }
     * })
     */
    upsert<T extends CmsCollectionUpsertArgs>(args: SelectSubset<T, CmsCollectionUpsertArgs<ExtArgs>>): Prisma__CmsCollectionClient<$Result.GetResult<Prisma.$CmsCollectionPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of CmsCollections.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CmsCollectionCountArgs} args - Arguments to filter CmsCollections to count.
     * @example
     * // Count the number of CmsCollections
     * const count = await prisma.cmsCollection.count({
     *   where: {
     *     // ... the filter for the CmsCollections we want to count
     *   }
     * })
    **/
    count<T extends CmsCollectionCountArgs>(
      args?: Subset<T, CmsCollectionCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], CmsCollectionCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a CmsCollection.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CmsCollectionAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends CmsCollectionAggregateArgs>(args: Subset<T, CmsCollectionAggregateArgs>): Prisma.PrismaPromise<GetCmsCollectionAggregateType<T>>

    /**
     * Group by CmsCollection.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CmsCollectionGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends CmsCollectionGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: CmsCollectionGroupByArgs['orderBy'] }
        : { orderBy?: CmsCollectionGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, CmsCollectionGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetCmsCollectionGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the CmsCollection model
   */
  readonly fields: CmsCollectionFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for CmsCollection.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__CmsCollectionClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    records<T extends CmsCollection$recordsArgs<ExtArgs> = {}>(args?: Subset<T, CmsCollection$recordsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CmsRecordPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the CmsCollection model
   */
  interface CmsCollectionFieldRefs {
    readonly id: FieldRef<"CmsCollection", 'String'>
    readonly siteId: FieldRef<"CmsCollection", 'String'>
    readonly name: FieldRef<"CmsCollection", 'String'>
    readonly slug: FieldRef<"CmsCollection", 'String'>
    readonly description: FieldRef<"CmsCollection", 'String'>
    readonly schemaDefinition: FieldRef<"CmsCollection", 'Json'>
    readonly createdAt: FieldRef<"CmsCollection", 'DateTime'>
    readonly updatedAt: FieldRef<"CmsCollection", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * CmsCollection findUnique
   */
  export type CmsCollectionFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CmsCollection
     */
    select?: CmsCollectionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CmsCollection
     */
    omit?: CmsCollectionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CmsCollectionInclude<ExtArgs> | null
    /**
     * Filter, which CmsCollection to fetch.
     */
    where: CmsCollectionWhereUniqueInput
  }

  /**
   * CmsCollection findUniqueOrThrow
   */
  export type CmsCollectionFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CmsCollection
     */
    select?: CmsCollectionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CmsCollection
     */
    omit?: CmsCollectionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CmsCollectionInclude<ExtArgs> | null
    /**
     * Filter, which CmsCollection to fetch.
     */
    where: CmsCollectionWhereUniqueInput
  }

  /**
   * CmsCollection findFirst
   */
  export type CmsCollectionFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CmsCollection
     */
    select?: CmsCollectionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CmsCollection
     */
    omit?: CmsCollectionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CmsCollectionInclude<ExtArgs> | null
    /**
     * Filter, which CmsCollection to fetch.
     */
    where?: CmsCollectionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of CmsCollections to fetch.
     */
    orderBy?: CmsCollectionOrderByWithRelationInput | CmsCollectionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for CmsCollections.
     */
    cursor?: CmsCollectionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` CmsCollections from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` CmsCollections.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of CmsCollections.
     */
    distinct?: CmsCollectionScalarFieldEnum | CmsCollectionScalarFieldEnum[]
  }

  /**
   * CmsCollection findFirstOrThrow
   */
  export type CmsCollectionFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CmsCollection
     */
    select?: CmsCollectionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CmsCollection
     */
    omit?: CmsCollectionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CmsCollectionInclude<ExtArgs> | null
    /**
     * Filter, which CmsCollection to fetch.
     */
    where?: CmsCollectionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of CmsCollections to fetch.
     */
    orderBy?: CmsCollectionOrderByWithRelationInput | CmsCollectionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for CmsCollections.
     */
    cursor?: CmsCollectionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` CmsCollections from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` CmsCollections.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of CmsCollections.
     */
    distinct?: CmsCollectionScalarFieldEnum | CmsCollectionScalarFieldEnum[]
  }

  /**
   * CmsCollection findMany
   */
  export type CmsCollectionFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CmsCollection
     */
    select?: CmsCollectionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CmsCollection
     */
    omit?: CmsCollectionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CmsCollectionInclude<ExtArgs> | null
    /**
     * Filter, which CmsCollections to fetch.
     */
    where?: CmsCollectionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of CmsCollections to fetch.
     */
    orderBy?: CmsCollectionOrderByWithRelationInput | CmsCollectionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing CmsCollections.
     */
    cursor?: CmsCollectionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` CmsCollections from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` CmsCollections.
     */
    skip?: number
    distinct?: CmsCollectionScalarFieldEnum | CmsCollectionScalarFieldEnum[]
  }

  /**
   * CmsCollection create
   */
  export type CmsCollectionCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CmsCollection
     */
    select?: CmsCollectionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CmsCollection
     */
    omit?: CmsCollectionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CmsCollectionInclude<ExtArgs> | null
    /**
     * The data needed to create a CmsCollection.
     */
    data: XOR<CmsCollectionCreateInput, CmsCollectionUncheckedCreateInput>
  }

  /**
   * CmsCollection createMany
   */
  export type CmsCollectionCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many CmsCollections.
     */
    data: CmsCollectionCreateManyInput | CmsCollectionCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * CmsCollection createManyAndReturn
   */
  export type CmsCollectionCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CmsCollection
     */
    select?: CmsCollectionSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the CmsCollection
     */
    omit?: CmsCollectionOmit<ExtArgs> | null
    /**
     * The data used to create many CmsCollections.
     */
    data: CmsCollectionCreateManyInput | CmsCollectionCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * CmsCollection update
   */
  export type CmsCollectionUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CmsCollection
     */
    select?: CmsCollectionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CmsCollection
     */
    omit?: CmsCollectionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CmsCollectionInclude<ExtArgs> | null
    /**
     * The data needed to update a CmsCollection.
     */
    data: XOR<CmsCollectionUpdateInput, CmsCollectionUncheckedUpdateInput>
    /**
     * Choose, which CmsCollection to update.
     */
    where: CmsCollectionWhereUniqueInput
  }

  /**
   * CmsCollection updateMany
   */
  export type CmsCollectionUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update CmsCollections.
     */
    data: XOR<CmsCollectionUpdateManyMutationInput, CmsCollectionUncheckedUpdateManyInput>
    /**
     * Filter which CmsCollections to update
     */
    where?: CmsCollectionWhereInput
    /**
     * Limit how many CmsCollections to update.
     */
    limit?: number
  }

  /**
   * CmsCollection updateManyAndReturn
   */
  export type CmsCollectionUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CmsCollection
     */
    select?: CmsCollectionSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the CmsCollection
     */
    omit?: CmsCollectionOmit<ExtArgs> | null
    /**
     * The data used to update CmsCollections.
     */
    data: XOR<CmsCollectionUpdateManyMutationInput, CmsCollectionUncheckedUpdateManyInput>
    /**
     * Filter which CmsCollections to update
     */
    where?: CmsCollectionWhereInput
    /**
     * Limit how many CmsCollections to update.
     */
    limit?: number
  }

  /**
   * CmsCollection upsert
   */
  export type CmsCollectionUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CmsCollection
     */
    select?: CmsCollectionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CmsCollection
     */
    omit?: CmsCollectionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CmsCollectionInclude<ExtArgs> | null
    /**
     * The filter to search for the CmsCollection to update in case it exists.
     */
    where: CmsCollectionWhereUniqueInput
    /**
     * In case the CmsCollection found by the `where` argument doesn't exist, create a new CmsCollection with this data.
     */
    create: XOR<CmsCollectionCreateInput, CmsCollectionUncheckedCreateInput>
    /**
     * In case the CmsCollection was found with the provided `where` argument, update it with this data.
     */
    update: XOR<CmsCollectionUpdateInput, CmsCollectionUncheckedUpdateInput>
  }

  /**
   * CmsCollection delete
   */
  export type CmsCollectionDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CmsCollection
     */
    select?: CmsCollectionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CmsCollection
     */
    omit?: CmsCollectionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CmsCollectionInclude<ExtArgs> | null
    /**
     * Filter which CmsCollection to delete.
     */
    where: CmsCollectionWhereUniqueInput
  }

  /**
   * CmsCollection deleteMany
   */
  export type CmsCollectionDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which CmsCollections to delete
     */
    where?: CmsCollectionWhereInput
    /**
     * Limit how many CmsCollections to delete.
     */
    limit?: number
  }

  /**
   * CmsCollection.records
   */
  export type CmsCollection$recordsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CmsRecord
     */
    select?: CmsRecordSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CmsRecord
     */
    omit?: CmsRecordOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CmsRecordInclude<ExtArgs> | null
    where?: CmsRecordWhereInput
    orderBy?: CmsRecordOrderByWithRelationInput | CmsRecordOrderByWithRelationInput[]
    cursor?: CmsRecordWhereUniqueInput
    take?: number
    skip?: number
    distinct?: CmsRecordScalarFieldEnum | CmsRecordScalarFieldEnum[]
  }

  /**
   * CmsCollection without action
   */
  export type CmsCollectionDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CmsCollection
     */
    select?: CmsCollectionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CmsCollection
     */
    omit?: CmsCollectionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CmsCollectionInclude<ExtArgs> | null
  }


  /**
   * Model CmsRecord
   */

  export type AggregateCmsRecord = {
    _count: CmsRecordCountAggregateOutputType | null
    _min: CmsRecordMinAggregateOutputType | null
    _max: CmsRecordMaxAggregateOutputType | null
  }

  export type CmsRecordMinAggregateOutputType = {
    id: string | null
    createdBy: string | null
    createdAt: Date | null
    updatedAt: Date | null
    collectionId: string | null
  }

  export type CmsRecordMaxAggregateOutputType = {
    id: string | null
    createdBy: string | null
    createdAt: Date | null
    updatedAt: Date | null
    collectionId: string | null
  }

  export type CmsRecordCountAggregateOutputType = {
    id: number
    data: number
    createdBy: number
    createdAt: number
    updatedAt: number
    collectionId: number
    _all: number
  }


  export type CmsRecordMinAggregateInputType = {
    id?: true
    createdBy?: true
    createdAt?: true
    updatedAt?: true
    collectionId?: true
  }

  export type CmsRecordMaxAggregateInputType = {
    id?: true
    createdBy?: true
    createdAt?: true
    updatedAt?: true
    collectionId?: true
  }

  export type CmsRecordCountAggregateInputType = {
    id?: true
    data?: true
    createdBy?: true
    createdAt?: true
    updatedAt?: true
    collectionId?: true
    _all?: true
  }

  export type CmsRecordAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which CmsRecord to aggregate.
     */
    where?: CmsRecordWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of CmsRecords to fetch.
     */
    orderBy?: CmsRecordOrderByWithRelationInput | CmsRecordOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: CmsRecordWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` CmsRecords from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` CmsRecords.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned CmsRecords
    **/
    _count?: true | CmsRecordCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: CmsRecordMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: CmsRecordMaxAggregateInputType
  }

  export type GetCmsRecordAggregateType<T extends CmsRecordAggregateArgs> = {
        [P in keyof T & keyof AggregateCmsRecord]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateCmsRecord[P]>
      : GetScalarType<T[P], AggregateCmsRecord[P]>
  }




  export type CmsRecordGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: CmsRecordWhereInput
    orderBy?: CmsRecordOrderByWithAggregationInput | CmsRecordOrderByWithAggregationInput[]
    by: CmsRecordScalarFieldEnum[] | CmsRecordScalarFieldEnum
    having?: CmsRecordScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: CmsRecordCountAggregateInputType | true
    _min?: CmsRecordMinAggregateInputType
    _max?: CmsRecordMaxAggregateInputType
  }

  export type CmsRecordGroupByOutputType = {
    id: string
    data: JsonValue
    createdBy: string
    createdAt: Date
    updatedAt: Date
    collectionId: string
    _count: CmsRecordCountAggregateOutputType | null
    _min: CmsRecordMinAggregateOutputType | null
    _max: CmsRecordMaxAggregateOutputType | null
  }

  type GetCmsRecordGroupByPayload<T extends CmsRecordGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<CmsRecordGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof CmsRecordGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], CmsRecordGroupByOutputType[P]>
            : GetScalarType<T[P], CmsRecordGroupByOutputType[P]>
        }
      >
    >


  export type CmsRecordSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    data?: boolean
    createdBy?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    collectionId?: boolean
    collection?: boolean | CmsCollectionDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["cmsRecord"]>

  export type CmsRecordSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    data?: boolean
    createdBy?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    collectionId?: boolean
    collection?: boolean | CmsCollectionDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["cmsRecord"]>

  export type CmsRecordSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    data?: boolean
    createdBy?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    collectionId?: boolean
    collection?: boolean | CmsCollectionDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["cmsRecord"]>

  export type CmsRecordSelectScalar = {
    id?: boolean
    data?: boolean
    createdBy?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    collectionId?: boolean
  }

  export type CmsRecordOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "data" | "createdBy" | "createdAt" | "updatedAt" | "collectionId", ExtArgs["result"]["cmsRecord"]>
  export type CmsRecordInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    collection?: boolean | CmsCollectionDefaultArgs<ExtArgs>
  }
  export type CmsRecordIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    collection?: boolean | CmsCollectionDefaultArgs<ExtArgs>
  }
  export type CmsRecordIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    collection?: boolean | CmsCollectionDefaultArgs<ExtArgs>
  }

  export type $CmsRecordPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "CmsRecord"
    objects: {
      collection: Prisma.$CmsCollectionPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      data: Prisma.JsonValue
      createdBy: string
      createdAt: Date
      updatedAt: Date
      collectionId: string
    }, ExtArgs["result"]["cmsRecord"]>
    composites: {}
  }

  type CmsRecordGetPayload<S extends boolean | null | undefined | CmsRecordDefaultArgs> = $Result.GetResult<Prisma.$CmsRecordPayload, S>

  type CmsRecordCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<CmsRecordFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: CmsRecordCountAggregateInputType | true
    }

  export interface CmsRecordDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['CmsRecord'], meta: { name: 'CmsRecord' } }
    /**
     * Find zero or one CmsRecord that matches the filter.
     * @param {CmsRecordFindUniqueArgs} args - Arguments to find a CmsRecord
     * @example
     * // Get one CmsRecord
     * const cmsRecord = await prisma.cmsRecord.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends CmsRecordFindUniqueArgs>(args: SelectSubset<T, CmsRecordFindUniqueArgs<ExtArgs>>): Prisma__CmsRecordClient<$Result.GetResult<Prisma.$CmsRecordPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one CmsRecord that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {CmsRecordFindUniqueOrThrowArgs} args - Arguments to find a CmsRecord
     * @example
     * // Get one CmsRecord
     * const cmsRecord = await prisma.cmsRecord.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends CmsRecordFindUniqueOrThrowArgs>(args: SelectSubset<T, CmsRecordFindUniqueOrThrowArgs<ExtArgs>>): Prisma__CmsRecordClient<$Result.GetResult<Prisma.$CmsRecordPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first CmsRecord that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CmsRecordFindFirstArgs} args - Arguments to find a CmsRecord
     * @example
     * // Get one CmsRecord
     * const cmsRecord = await prisma.cmsRecord.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends CmsRecordFindFirstArgs>(args?: SelectSubset<T, CmsRecordFindFirstArgs<ExtArgs>>): Prisma__CmsRecordClient<$Result.GetResult<Prisma.$CmsRecordPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first CmsRecord that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CmsRecordFindFirstOrThrowArgs} args - Arguments to find a CmsRecord
     * @example
     * // Get one CmsRecord
     * const cmsRecord = await prisma.cmsRecord.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends CmsRecordFindFirstOrThrowArgs>(args?: SelectSubset<T, CmsRecordFindFirstOrThrowArgs<ExtArgs>>): Prisma__CmsRecordClient<$Result.GetResult<Prisma.$CmsRecordPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more CmsRecords that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CmsRecordFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all CmsRecords
     * const cmsRecords = await prisma.cmsRecord.findMany()
     * 
     * // Get first 10 CmsRecords
     * const cmsRecords = await prisma.cmsRecord.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const cmsRecordWithIdOnly = await prisma.cmsRecord.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends CmsRecordFindManyArgs>(args?: SelectSubset<T, CmsRecordFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CmsRecordPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a CmsRecord.
     * @param {CmsRecordCreateArgs} args - Arguments to create a CmsRecord.
     * @example
     * // Create one CmsRecord
     * const CmsRecord = await prisma.cmsRecord.create({
     *   data: {
     *     // ... data to create a CmsRecord
     *   }
     * })
     * 
     */
    create<T extends CmsRecordCreateArgs>(args: SelectSubset<T, CmsRecordCreateArgs<ExtArgs>>): Prisma__CmsRecordClient<$Result.GetResult<Prisma.$CmsRecordPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many CmsRecords.
     * @param {CmsRecordCreateManyArgs} args - Arguments to create many CmsRecords.
     * @example
     * // Create many CmsRecords
     * const cmsRecord = await prisma.cmsRecord.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends CmsRecordCreateManyArgs>(args?: SelectSubset<T, CmsRecordCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many CmsRecords and returns the data saved in the database.
     * @param {CmsRecordCreateManyAndReturnArgs} args - Arguments to create many CmsRecords.
     * @example
     * // Create many CmsRecords
     * const cmsRecord = await prisma.cmsRecord.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many CmsRecords and only return the `id`
     * const cmsRecordWithIdOnly = await prisma.cmsRecord.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends CmsRecordCreateManyAndReturnArgs>(args?: SelectSubset<T, CmsRecordCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CmsRecordPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a CmsRecord.
     * @param {CmsRecordDeleteArgs} args - Arguments to delete one CmsRecord.
     * @example
     * // Delete one CmsRecord
     * const CmsRecord = await prisma.cmsRecord.delete({
     *   where: {
     *     // ... filter to delete one CmsRecord
     *   }
     * })
     * 
     */
    delete<T extends CmsRecordDeleteArgs>(args: SelectSubset<T, CmsRecordDeleteArgs<ExtArgs>>): Prisma__CmsRecordClient<$Result.GetResult<Prisma.$CmsRecordPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one CmsRecord.
     * @param {CmsRecordUpdateArgs} args - Arguments to update one CmsRecord.
     * @example
     * // Update one CmsRecord
     * const cmsRecord = await prisma.cmsRecord.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends CmsRecordUpdateArgs>(args: SelectSubset<T, CmsRecordUpdateArgs<ExtArgs>>): Prisma__CmsRecordClient<$Result.GetResult<Prisma.$CmsRecordPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more CmsRecords.
     * @param {CmsRecordDeleteManyArgs} args - Arguments to filter CmsRecords to delete.
     * @example
     * // Delete a few CmsRecords
     * const { count } = await prisma.cmsRecord.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends CmsRecordDeleteManyArgs>(args?: SelectSubset<T, CmsRecordDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more CmsRecords.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CmsRecordUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many CmsRecords
     * const cmsRecord = await prisma.cmsRecord.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends CmsRecordUpdateManyArgs>(args: SelectSubset<T, CmsRecordUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more CmsRecords and returns the data updated in the database.
     * @param {CmsRecordUpdateManyAndReturnArgs} args - Arguments to update many CmsRecords.
     * @example
     * // Update many CmsRecords
     * const cmsRecord = await prisma.cmsRecord.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more CmsRecords and only return the `id`
     * const cmsRecordWithIdOnly = await prisma.cmsRecord.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends CmsRecordUpdateManyAndReturnArgs>(args: SelectSubset<T, CmsRecordUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CmsRecordPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one CmsRecord.
     * @param {CmsRecordUpsertArgs} args - Arguments to update or create a CmsRecord.
     * @example
     * // Update or create a CmsRecord
     * const cmsRecord = await prisma.cmsRecord.upsert({
     *   create: {
     *     // ... data to create a CmsRecord
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the CmsRecord we want to update
     *   }
     * })
     */
    upsert<T extends CmsRecordUpsertArgs>(args: SelectSubset<T, CmsRecordUpsertArgs<ExtArgs>>): Prisma__CmsRecordClient<$Result.GetResult<Prisma.$CmsRecordPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of CmsRecords.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CmsRecordCountArgs} args - Arguments to filter CmsRecords to count.
     * @example
     * // Count the number of CmsRecords
     * const count = await prisma.cmsRecord.count({
     *   where: {
     *     // ... the filter for the CmsRecords we want to count
     *   }
     * })
    **/
    count<T extends CmsRecordCountArgs>(
      args?: Subset<T, CmsRecordCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], CmsRecordCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a CmsRecord.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CmsRecordAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends CmsRecordAggregateArgs>(args: Subset<T, CmsRecordAggregateArgs>): Prisma.PrismaPromise<GetCmsRecordAggregateType<T>>

    /**
     * Group by CmsRecord.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CmsRecordGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends CmsRecordGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: CmsRecordGroupByArgs['orderBy'] }
        : { orderBy?: CmsRecordGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, CmsRecordGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetCmsRecordGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the CmsRecord model
   */
  readonly fields: CmsRecordFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for CmsRecord.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__CmsRecordClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    collection<T extends CmsCollectionDefaultArgs<ExtArgs> = {}>(args?: Subset<T, CmsCollectionDefaultArgs<ExtArgs>>): Prisma__CmsCollectionClient<$Result.GetResult<Prisma.$CmsCollectionPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the CmsRecord model
   */
  interface CmsRecordFieldRefs {
    readonly id: FieldRef<"CmsRecord", 'String'>
    readonly data: FieldRef<"CmsRecord", 'Json'>
    readonly createdBy: FieldRef<"CmsRecord", 'String'>
    readonly createdAt: FieldRef<"CmsRecord", 'DateTime'>
    readonly updatedAt: FieldRef<"CmsRecord", 'DateTime'>
    readonly collectionId: FieldRef<"CmsRecord", 'String'>
  }
    

  // Custom InputTypes
  /**
   * CmsRecord findUnique
   */
  export type CmsRecordFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CmsRecord
     */
    select?: CmsRecordSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CmsRecord
     */
    omit?: CmsRecordOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CmsRecordInclude<ExtArgs> | null
    /**
     * Filter, which CmsRecord to fetch.
     */
    where: CmsRecordWhereUniqueInput
  }

  /**
   * CmsRecord findUniqueOrThrow
   */
  export type CmsRecordFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CmsRecord
     */
    select?: CmsRecordSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CmsRecord
     */
    omit?: CmsRecordOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CmsRecordInclude<ExtArgs> | null
    /**
     * Filter, which CmsRecord to fetch.
     */
    where: CmsRecordWhereUniqueInput
  }

  /**
   * CmsRecord findFirst
   */
  export type CmsRecordFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CmsRecord
     */
    select?: CmsRecordSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CmsRecord
     */
    omit?: CmsRecordOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CmsRecordInclude<ExtArgs> | null
    /**
     * Filter, which CmsRecord to fetch.
     */
    where?: CmsRecordWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of CmsRecords to fetch.
     */
    orderBy?: CmsRecordOrderByWithRelationInput | CmsRecordOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for CmsRecords.
     */
    cursor?: CmsRecordWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` CmsRecords from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` CmsRecords.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of CmsRecords.
     */
    distinct?: CmsRecordScalarFieldEnum | CmsRecordScalarFieldEnum[]
  }

  /**
   * CmsRecord findFirstOrThrow
   */
  export type CmsRecordFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CmsRecord
     */
    select?: CmsRecordSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CmsRecord
     */
    omit?: CmsRecordOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CmsRecordInclude<ExtArgs> | null
    /**
     * Filter, which CmsRecord to fetch.
     */
    where?: CmsRecordWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of CmsRecords to fetch.
     */
    orderBy?: CmsRecordOrderByWithRelationInput | CmsRecordOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for CmsRecords.
     */
    cursor?: CmsRecordWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` CmsRecords from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` CmsRecords.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of CmsRecords.
     */
    distinct?: CmsRecordScalarFieldEnum | CmsRecordScalarFieldEnum[]
  }

  /**
   * CmsRecord findMany
   */
  export type CmsRecordFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CmsRecord
     */
    select?: CmsRecordSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CmsRecord
     */
    omit?: CmsRecordOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CmsRecordInclude<ExtArgs> | null
    /**
     * Filter, which CmsRecords to fetch.
     */
    where?: CmsRecordWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of CmsRecords to fetch.
     */
    orderBy?: CmsRecordOrderByWithRelationInput | CmsRecordOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing CmsRecords.
     */
    cursor?: CmsRecordWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` CmsRecords from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` CmsRecords.
     */
    skip?: number
    distinct?: CmsRecordScalarFieldEnum | CmsRecordScalarFieldEnum[]
  }

  /**
   * CmsRecord create
   */
  export type CmsRecordCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CmsRecord
     */
    select?: CmsRecordSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CmsRecord
     */
    omit?: CmsRecordOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CmsRecordInclude<ExtArgs> | null
    /**
     * The data needed to create a CmsRecord.
     */
    data: XOR<CmsRecordCreateInput, CmsRecordUncheckedCreateInput>
  }

  /**
   * CmsRecord createMany
   */
  export type CmsRecordCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many CmsRecords.
     */
    data: CmsRecordCreateManyInput | CmsRecordCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * CmsRecord createManyAndReturn
   */
  export type CmsRecordCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CmsRecord
     */
    select?: CmsRecordSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the CmsRecord
     */
    omit?: CmsRecordOmit<ExtArgs> | null
    /**
     * The data used to create many CmsRecords.
     */
    data: CmsRecordCreateManyInput | CmsRecordCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CmsRecordIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * CmsRecord update
   */
  export type CmsRecordUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CmsRecord
     */
    select?: CmsRecordSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CmsRecord
     */
    omit?: CmsRecordOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CmsRecordInclude<ExtArgs> | null
    /**
     * The data needed to update a CmsRecord.
     */
    data: XOR<CmsRecordUpdateInput, CmsRecordUncheckedUpdateInput>
    /**
     * Choose, which CmsRecord to update.
     */
    where: CmsRecordWhereUniqueInput
  }

  /**
   * CmsRecord updateMany
   */
  export type CmsRecordUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update CmsRecords.
     */
    data: XOR<CmsRecordUpdateManyMutationInput, CmsRecordUncheckedUpdateManyInput>
    /**
     * Filter which CmsRecords to update
     */
    where?: CmsRecordWhereInput
    /**
     * Limit how many CmsRecords to update.
     */
    limit?: number
  }

  /**
   * CmsRecord updateManyAndReturn
   */
  export type CmsRecordUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CmsRecord
     */
    select?: CmsRecordSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the CmsRecord
     */
    omit?: CmsRecordOmit<ExtArgs> | null
    /**
     * The data used to update CmsRecords.
     */
    data: XOR<CmsRecordUpdateManyMutationInput, CmsRecordUncheckedUpdateManyInput>
    /**
     * Filter which CmsRecords to update
     */
    where?: CmsRecordWhereInput
    /**
     * Limit how many CmsRecords to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CmsRecordIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * CmsRecord upsert
   */
  export type CmsRecordUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CmsRecord
     */
    select?: CmsRecordSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CmsRecord
     */
    omit?: CmsRecordOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CmsRecordInclude<ExtArgs> | null
    /**
     * The filter to search for the CmsRecord to update in case it exists.
     */
    where: CmsRecordWhereUniqueInput
    /**
     * In case the CmsRecord found by the `where` argument doesn't exist, create a new CmsRecord with this data.
     */
    create: XOR<CmsRecordCreateInput, CmsRecordUncheckedCreateInput>
    /**
     * In case the CmsRecord was found with the provided `where` argument, update it with this data.
     */
    update: XOR<CmsRecordUpdateInput, CmsRecordUncheckedUpdateInput>
  }

  /**
   * CmsRecord delete
   */
  export type CmsRecordDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CmsRecord
     */
    select?: CmsRecordSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CmsRecord
     */
    omit?: CmsRecordOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CmsRecordInclude<ExtArgs> | null
    /**
     * Filter which CmsRecord to delete.
     */
    where: CmsRecordWhereUniqueInput
  }

  /**
   * CmsRecord deleteMany
   */
  export type CmsRecordDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which CmsRecords to delete
     */
    where?: CmsRecordWhereInput
    /**
     * Limit how many CmsRecords to delete.
     */
    limit?: number
  }

  /**
   * CmsRecord without action
   */
  export type CmsRecordDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CmsRecord
     */
    select?: CmsRecordSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CmsRecord
     */
    omit?: CmsRecordOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CmsRecordInclude<ExtArgs> | null
  }


  /**
   * Enums
   */

  export const TransactionIsolationLevel: {
    ReadUncommitted: 'ReadUncommitted',
    ReadCommitted: 'ReadCommitted',
    RepeatableRead: 'RepeatableRead',
    Serializable: 'Serializable'
  };

  export type TransactionIsolationLevel = (typeof TransactionIsolationLevel)[keyof typeof TransactionIsolationLevel]


  export const CmsCollectionScalarFieldEnum: {
    id: 'id',
    siteId: 'siteId',
    name: 'name',
    slug: 'slug',
    description: 'description',
    schemaDefinition: 'schemaDefinition',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type CmsCollectionScalarFieldEnum = (typeof CmsCollectionScalarFieldEnum)[keyof typeof CmsCollectionScalarFieldEnum]


  export const CmsRecordScalarFieldEnum: {
    id: 'id',
    data: 'data',
    createdBy: 'createdBy',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
    collectionId: 'collectionId'
  };

  export type CmsRecordScalarFieldEnum = (typeof CmsRecordScalarFieldEnum)[keyof typeof CmsRecordScalarFieldEnum]


  export const SortOrder: {
    asc: 'asc',
    desc: 'desc'
  };

  export type SortOrder = (typeof SortOrder)[keyof typeof SortOrder]


  export const JsonNullValueInput: {
    JsonNull: typeof JsonNull
  };

  export type JsonNullValueInput = (typeof JsonNullValueInput)[keyof typeof JsonNullValueInput]


  export const QueryMode: {
    default: 'default',
    insensitive: 'insensitive'
  };

  export type QueryMode = (typeof QueryMode)[keyof typeof QueryMode]


  export const JsonNullValueFilter: {
    DbNull: typeof DbNull,
    JsonNull: typeof JsonNull,
    AnyNull: typeof AnyNull
  };

  export type JsonNullValueFilter = (typeof JsonNullValueFilter)[keyof typeof JsonNullValueFilter]


  export const NullsOrder: {
    first: 'first',
    last: 'last'
  };

  export type NullsOrder = (typeof NullsOrder)[keyof typeof NullsOrder]


  /**
   * Field references
   */


  /**
   * Reference to a field of type 'String'
   */
  export type StringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String'>
    


  /**
   * Reference to a field of type 'String[]'
   */
  export type ListStringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String[]'>
    


  /**
   * Reference to a field of type 'Json'
   */
  export type JsonFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Json'>
    


  /**
   * Reference to a field of type 'QueryMode'
   */
  export type EnumQueryModeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'QueryMode'>
    


  /**
   * Reference to a field of type 'DateTime'
   */
  export type DateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime'>
    


  /**
   * Reference to a field of type 'DateTime[]'
   */
  export type ListDateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime[]'>
    


  /**
   * Reference to a field of type 'Int'
   */
  export type IntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int'>
    


  /**
   * Reference to a field of type 'Int[]'
   */
  export type ListIntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int[]'>
    
  /**
   * Deep Input Types
   */


  export type CmsCollectionWhereInput = {
    AND?: CmsCollectionWhereInput | CmsCollectionWhereInput[]
    OR?: CmsCollectionWhereInput[]
    NOT?: CmsCollectionWhereInput | CmsCollectionWhereInput[]
    id?: StringFilter<"CmsCollection"> | string
    siteId?: StringFilter<"CmsCollection"> | string
    name?: StringFilter<"CmsCollection"> | string
    slug?: StringFilter<"CmsCollection"> | string
    description?: StringNullableFilter<"CmsCollection"> | string | null
    schemaDefinition?: JsonFilter<"CmsCollection">
    createdAt?: DateTimeFilter<"CmsCollection"> | Date | string
    updatedAt?: DateTimeFilter<"CmsCollection"> | Date | string
    records?: CmsRecordListRelationFilter
  }

  export type CmsCollectionOrderByWithRelationInput = {
    id?: SortOrder
    siteId?: SortOrder
    name?: SortOrder
    slug?: SortOrder
    description?: SortOrderInput | SortOrder
    schemaDefinition?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    records?: CmsRecordOrderByRelationAggregateInput
  }

  export type CmsCollectionWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    siteId_slug?: CmsCollectionSiteIdSlugCompoundUniqueInput
    AND?: CmsCollectionWhereInput | CmsCollectionWhereInput[]
    OR?: CmsCollectionWhereInput[]
    NOT?: CmsCollectionWhereInput | CmsCollectionWhereInput[]
    siteId?: StringFilter<"CmsCollection"> | string
    name?: StringFilter<"CmsCollection"> | string
    slug?: StringFilter<"CmsCollection"> | string
    description?: StringNullableFilter<"CmsCollection"> | string | null
    schemaDefinition?: JsonFilter<"CmsCollection">
    createdAt?: DateTimeFilter<"CmsCollection"> | Date | string
    updatedAt?: DateTimeFilter<"CmsCollection"> | Date | string
    records?: CmsRecordListRelationFilter
  }, "id" | "siteId_slug">

  export type CmsCollectionOrderByWithAggregationInput = {
    id?: SortOrder
    siteId?: SortOrder
    name?: SortOrder
    slug?: SortOrder
    description?: SortOrderInput | SortOrder
    schemaDefinition?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: CmsCollectionCountOrderByAggregateInput
    _max?: CmsCollectionMaxOrderByAggregateInput
    _min?: CmsCollectionMinOrderByAggregateInput
  }

  export type CmsCollectionScalarWhereWithAggregatesInput = {
    AND?: CmsCollectionScalarWhereWithAggregatesInput | CmsCollectionScalarWhereWithAggregatesInput[]
    OR?: CmsCollectionScalarWhereWithAggregatesInput[]
    NOT?: CmsCollectionScalarWhereWithAggregatesInput | CmsCollectionScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"CmsCollection"> | string
    siteId?: StringWithAggregatesFilter<"CmsCollection"> | string
    name?: StringWithAggregatesFilter<"CmsCollection"> | string
    slug?: StringWithAggregatesFilter<"CmsCollection"> | string
    description?: StringNullableWithAggregatesFilter<"CmsCollection"> | string | null
    schemaDefinition?: JsonWithAggregatesFilter<"CmsCollection">
    createdAt?: DateTimeWithAggregatesFilter<"CmsCollection"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"CmsCollection"> | Date | string
  }

  export type CmsRecordWhereInput = {
    AND?: CmsRecordWhereInput | CmsRecordWhereInput[]
    OR?: CmsRecordWhereInput[]
    NOT?: CmsRecordWhereInput | CmsRecordWhereInput[]
    id?: StringFilter<"CmsRecord"> | string
    data?: JsonFilter<"CmsRecord">
    createdBy?: StringFilter<"CmsRecord"> | string
    createdAt?: DateTimeFilter<"CmsRecord"> | Date | string
    updatedAt?: DateTimeFilter<"CmsRecord"> | Date | string
    collectionId?: StringFilter<"CmsRecord"> | string
    collection?: XOR<CmsCollectionScalarRelationFilter, CmsCollectionWhereInput>
  }

  export type CmsRecordOrderByWithRelationInput = {
    id?: SortOrder
    data?: SortOrder
    createdBy?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    collectionId?: SortOrder
    collection?: CmsCollectionOrderByWithRelationInput
  }

  export type CmsRecordWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: CmsRecordWhereInput | CmsRecordWhereInput[]
    OR?: CmsRecordWhereInput[]
    NOT?: CmsRecordWhereInput | CmsRecordWhereInput[]
    data?: JsonFilter<"CmsRecord">
    createdBy?: StringFilter<"CmsRecord"> | string
    createdAt?: DateTimeFilter<"CmsRecord"> | Date | string
    updatedAt?: DateTimeFilter<"CmsRecord"> | Date | string
    collectionId?: StringFilter<"CmsRecord"> | string
    collection?: XOR<CmsCollectionScalarRelationFilter, CmsCollectionWhereInput>
  }, "id">

  export type CmsRecordOrderByWithAggregationInput = {
    id?: SortOrder
    data?: SortOrder
    createdBy?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    collectionId?: SortOrder
    _count?: CmsRecordCountOrderByAggregateInput
    _max?: CmsRecordMaxOrderByAggregateInput
    _min?: CmsRecordMinOrderByAggregateInput
  }

  export type CmsRecordScalarWhereWithAggregatesInput = {
    AND?: CmsRecordScalarWhereWithAggregatesInput | CmsRecordScalarWhereWithAggregatesInput[]
    OR?: CmsRecordScalarWhereWithAggregatesInput[]
    NOT?: CmsRecordScalarWhereWithAggregatesInput | CmsRecordScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"CmsRecord"> | string
    data?: JsonWithAggregatesFilter<"CmsRecord">
    createdBy?: StringWithAggregatesFilter<"CmsRecord"> | string
    createdAt?: DateTimeWithAggregatesFilter<"CmsRecord"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"CmsRecord"> | Date | string
    collectionId?: StringWithAggregatesFilter<"CmsRecord"> | string
  }

  export type CmsCollectionCreateInput = {
    id?: string
    siteId: string
    name: string
    slug: string
    description?: string | null
    schemaDefinition?: JsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    updatedAt?: Date | string
    records?: CmsRecordCreateNestedManyWithoutCollectionInput
  }

  export type CmsCollectionUncheckedCreateInput = {
    id?: string
    siteId: string
    name: string
    slug: string
    description?: string | null
    schemaDefinition?: JsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    updatedAt?: Date | string
    records?: CmsRecordUncheckedCreateNestedManyWithoutCollectionInput
  }

  export type CmsCollectionUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    siteId?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    schemaDefinition?: JsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    records?: CmsRecordUpdateManyWithoutCollectionNestedInput
  }

  export type CmsCollectionUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    siteId?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    schemaDefinition?: JsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    records?: CmsRecordUncheckedUpdateManyWithoutCollectionNestedInput
  }

  export type CmsCollectionCreateManyInput = {
    id?: string
    siteId: string
    name: string
    slug: string
    description?: string | null
    schemaDefinition?: JsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type CmsCollectionUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    siteId?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    schemaDefinition?: JsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CmsCollectionUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    siteId?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    schemaDefinition?: JsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CmsRecordCreateInput = {
    id?: string
    data?: JsonNullValueInput | InputJsonValue
    createdBy: string
    createdAt?: Date | string
    updatedAt?: Date | string
    collection: CmsCollectionCreateNestedOneWithoutRecordsInput
  }

  export type CmsRecordUncheckedCreateInput = {
    id?: string
    data?: JsonNullValueInput | InputJsonValue
    createdBy: string
    createdAt?: Date | string
    updatedAt?: Date | string
    collectionId: string
  }

  export type CmsRecordUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    data?: JsonNullValueInput | InputJsonValue
    createdBy?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    collection?: CmsCollectionUpdateOneRequiredWithoutRecordsNestedInput
  }

  export type CmsRecordUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    data?: JsonNullValueInput | InputJsonValue
    createdBy?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    collectionId?: StringFieldUpdateOperationsInput | string
  }

  export type CmsRecordCreateManyInput = {
    id?: string
    data?: JsonNullValueInput | InputJsonValue
    createdBy: string
    createdAt?: Date | string
    updatedAt?: Date | string
    collectionId: string
  }

  export type CmsRecordUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    data?: JsonNullValueInput | InputJsonValue
    createdBy?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CmsRecordUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    data?: JsonNullValueInput | InputJsonValue
    createdBy?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    collectionId?: StringFieldUpdateOperationsInput | string
  }

  export type StringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type StringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }
  export type JsonFilter<$PrismaModel = never> =
    | PatchUndefined<
        Either<Required<JsonFilterBase<$PrismaModel>>, Exclude<keyof Required<JsonFilterBase<$PrismaModel>>, 'path'>>,
        Required<JsonFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<JsonFilterBase<$PrismaModel>>, 'path'>>

  export type JsonFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    mode?: QueryMode | EnumQueryModeFieldRefInput<$PrismaModel>
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
  }

  export type DateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type CmsRecordListRelationFilter = {
    every?: CmsRecordWhereInput
    some?: CmsRecordWhereInput
    none?: CmsRecordWhereInput
  }

  export type SortOrderInput = {
    sort: SortOrder
    nulls?: NullsOrder
  }

  export type CmsRecordOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type CmsCollectionSiteIdSlugCompoundUniqueInput = {
    siteId: string
    slug: string
  }

  export type CmsCollectionCountOrderByAggregateInput = {
    id?: SortOrder
    siteId?: SortOrder
    name?: SortOrder
    slug?: SortOrder
    description?: SortOrder
    schemaDefinition?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type CmsCollectionMaxOrderByAggregateInput = {
    id?: SortOrder
    siteId?: SortOrder
    name?: SortOrder
    slug?: SortOrder
    description?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type CmsCollectionMinOrderByAggregateInput = {
    id?: SortOrder
    siteId?: SortOrder
    name?: SortOrder
    slug?: SortOrder
    description?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type StringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type StringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }
  export type JsonWithAggregatesFilter<$PrismaModel = never> =
    | PatchUndefined<
        Either<Required<JsonWithAggregatesFilterBase<$PrismaModel>>, Exclude<keyof Required<JsonWithAggregatesFilterBase<$PrismaModel>>, 'path'>>,
        Required<JsonWithAggregatesFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<JsonWithAggregatesFilterBase<$PrismaModel>>, 'path'>>

  export type JsonWithAggregatesFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    mode?: QueryMode | EnumQueryModeFieldRefInput<$PrismaModel>
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedJsonFilter<$PrismaModel>
    _max?: NestedJsonFilter<$PrismaModel>
  }

  export type DateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type CmsCollectionScalarRelationFilter = {
    is?: CmsCollectionWhereInput
    isNot?: CmsCollectionWhereInput
  }

  export type CmsRecordCountOrderByAggregateInput = {
    id?: SortOrder
    data?: SortOrder
    createdBy?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    collectionId?: SortOrder
  }

  export type CmsRecordMaxOrderByAggregateInput = {
    id?: SortOrder
    createdBy?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    collectionId?: SortOrder
  }

  export type CmsRecordMinOrderByAggregateInput = {
    id?: SortOrder
    createdBy?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    collectionId?: SortOrder
  }

  export type CmsRecordCreateNestedManyWithoutCollectionInput = {
    create?: XOR<CmsRecordCreateWithoutCollectionInput, CmsRecordUncheckedCreateWithoutCollectionInput> | CmsRecordCreateWithoutCollectionInput[] | CmsRecordUncheckedCreateWithoutCollectionInput[]
    connectOrCreate?: CmsRecordCreateOrConnectWithoutCollectionInput | CmsRecordCreateOrConnectWithoutCollectionInput[]
    createMany?: CmsRecordCreateManyCollectionInputEnvelope
    connect?: CmsRecordWhereUniqueInput | CmsRecordWhereUniqueInput[]
  }

  export type CmsRecordUncheckedCreateNestedManyWithoutCollectionInput = {
    create?: XOR<CmsRecordCreateWithoutCollectionInput, CmsRecordUncheckedCreateWithoutCollectionInput> | CmsRecordCreateWithoutCollectionInput[] | CmsRecordUncheckedCreateWithoutCollectionInput[]
    connectOrCreate?: CmsRecordCreateOrConnectWithoutCollectionInput | CmsRecordCreateOrConnectWithoutCollectionInput[]
    createMany?: CmsRecordCreateManyCollectionInputEnvelope
    connect?: CmsRecordWhereUniqueInput | CmsRecordWhereUniqueInput[]
  }

  export type StringFieldUpdateOperationsInput = {
    set?: string
  }

  export type NullableStringFieldUpdateOperationsInput = {
    set?: string | null
  }

  export type DateTimeFieldUpdateOperationsInput = {
    set?: Date | string
  }

  export type CmsRecordUpdateManyWithoutCollectionNestedInput = {
    create?: XOR<CmsRecordCreateWithoutCollectionInput, CmsRecordUncheckedCreateWithoutCollectionInput> | CmsRecordCreateWithoutCollectionInput[] | CmsRecordUncheckedCreateWithoutCollectionInput[]
    connectOrCreate?: CmsRecordCreateOrConnectWithoutCollectionInput | CmsRecordCreateOrConnectWithoutCollectionInput[]
    upsert?: CmsRecordUpsertWithWhereUniqueWithoutCollectionInput | CmsRecordUpsertWithWhereUniqueWithoutCollectionInput[]
    createMany?: CmsRecordCreateManyCollectionInputEnvelope
    set?: CmsRecordWhereUniqueInput | CmsRecordWhereUniqueInput[]
    disconnect?: CmsRecordWhereUniqueInput | CmsRecordWhereUniqueInput[]
    delete?: CmsRecordWhereUniqueInput | CmsRecordWhereUniqueInput[]
    connect?: CmsRecordWhereUniqueInput | CmsRecordWhereUniqueInput[]
    update?: CmsRecordUpdateWithWhereUniqueWithoutCollectionInput | CmsRecordUpdateWithWhereUniqueWithoutCollectionInput[]
    updateMany?: CmsRecordUpdateManyWithWhereWithoutCollectionInput | CmsRecordUpdateManyWithWhereWithoutCollectionInput[]
    deleteMany?: CmsRecordScalarWhereInput | CmsRecordScalarWhereInput[]
  }

  export type CmsRecordUncheckedUpdateManyWithoutCollectionNestedInput = {
    create?: XOR<CmsRecordCreateWithoutCollectionInput, CmsRecordUncheckedCreateWithoutCollectionInput> | CmsRecordCreateWithoutCollectionInput[] | CmsRecordUncheckedCreateWithoutCollectionInput[]
    connectOrCreate?: CmsRecordCreateOrConnectWithoutCollectionInput | CmsRecordCreateOrConnectWithoutCollectionInput[]
    upsert?: CmsRecordUpsertWithWhereUniqueWithoutCollectionInput | CmsRecordUpsertWithWhereUniqueWithoutCollectionInput[]
    createMany?: CmsRecordCreateManyCollectionInputEnvelope
    set?: CmsRecordWhereUniqueInput | CmsRecordWhereUniqueInput[]
    disconnect?: CmsRecordWhereUniqueInput | CmsRecordWhereUniqueInput[]
    delete?: CmsRecordWhereUniqueInput | CmsRecordWhereUniqueInput[]
    connect?: CmsRecordWhereUniqueInput | CmsRecordWhereUniqueInput[]
    update?: CmsRecordUpdateWithWhereUniqueWithoutCollectionInput | CmsRecordUpdateWithWhereUniqueWithoutCollectionInput[]
    updateMany?: CmsRecordUpdateManyWithWhereWithoutCollectionInput | CmsRecordUpdateManyWithWhereWithoutCollectionInput[]
    deleteMany?: CmsRecordScalarWhereInput | CmsRecordScalarWhereInput[]
  }

  export type CmsCollectionCreateNestedOneWithoutRecordsInput = {
    create?: XOR<CmsCollectionCreateWithoutRecordsInput, CmsCollectionUncheckedCreateWithoutRecordsInput>
    connectOrCreate?: CmsCollectionCreateOrConnectWithoutRecordsInput
    connect?: CmsCollectionWhereUniqueInput
  }

  export type CmsCollectionUpdateOneRequiredWithoutRecordsNestedInput = {
    create?: XOR<CmsCollectionCreateWithoutRecordsInput, CmsCollectionUncheckedCreateWithoutRecordsInput>
    connectOrCreate?: CmsCollectionCreateOrConnectWithoutRecordsInput
    upsert?: CmsCollectionUpsertWithoutRecordsInput
    connect?: CmsCollectionWhereUniqueInput
    update?: XOR<XOR<CmsCollectionUpdateToOneWithWhereWithoutRecordsInput, CmsCollectionUpdateWithoutRecordsInput>, CmsCollectionUncheckedUpdateWithoutRecordsInput>
  }

  export type NestedStringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type NestedStringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type NestedDateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type NestedStringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type NestedIntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type NestedStringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type NestedIntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableFilter<$PrismaModel> | number | null
  }
  export type NestedJsonFilter<$PrismaModel = never> =
    | PatchUndefined<
        Either<Required<NestedJsonFilterBase<$PrismaModel>>, Exclude<keyof Required<NestedJsonFilterBase<$PrismaModel>>, 'path'>>,
        Required<NestedJsonFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<NestedJsonFilterBase<$PrismaModel>>, 'path'>>

  export type NestedJsonFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    mode?: QueryMode | EnumQueryModeFieldRefInput<$PrismaModel>
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
  }

  export type NestedDateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type CmsRecordCreateWithoutCollectionInput = {
    id?: string
    data?: JsonNullValueInput | InputJsonValue
    createdBy: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type CmsRecordUncheckedCreateWithoutCollectionInput = {
    id?: string
    data?: JsonNullValueInput | InputJsonValue
    createdBy: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type CmsRecordCreateOrConnectWithoutCollectionInput = {
    where: CmsRecordWhereUniqueInput
    create: XOR<CmsRecordCreateWithoutCollectionInput, CmsRecordUncheckedCreateWithoutCollectionInput>
  }

  export type CmsRecordCreateManyCollectionInputEnvelope = {
    data: CmsRecordCreateManyCollectionInput | CmsRecordCreateManyCollectionInput[]
    skipDuplicates?: boolean
  }

  export type CmsRecordUpsertWithWhereUniqueWithoutCollectionInput = {
    where: CmsRecordWhereUniqueInput
    update: XOR<CmsRecordUpdateWithoutCollectionInput, CmsRecordUncheckedUpdateWithoutCollectionInput>
    create: XOR<CmsRecordCreateWithoutCollectionInput, CmsRecordUncheckedCreateWithoutCollectionInput>
  }

  export type CmsRecordUpdateWithWhereUniqueWithoutCollectionInput = {
    where: CmsRecordWhereUniqueInput
    data: XOR<CmsRecordUpdateWithoutCollectionInput, CmsRecordUncheckedUpdateWithoutCollectionInput>
  }

  export type CmsRecordUpdateManyWithWhereWithoutCollectionInput = {
    where: CmsRecordScalarWhereInput
    data: XOR<CmsRecordUpdateManyMutationInput, CmsRecordUncheckedUpdateManyWithoutCollectionInput>
  }

  export type CmsRecordScalarWhereInput = {
    AND?: CmsRecordScalarWhereInput | CmsRecordScalarWhereInput[]
    OR?: CmsRecordScalarWhereInput[]
    NOT?: CmsRecordScalarWhereInput | CmsRecordScalarWhereInput[]
    id?: StringFilter<"CmsRecord"> | string
    data?: JsonFilter<"CmsRecord">
    createdBy?: StringFilter<"CmsRecord"> | string
    createdAt?: DateTimeFilter<"CmsRecord"> | Date | string
    updatedAt?: DateTimeFilter<"CmsRecord"> | Date | string
    collectionId?: StringFilter<"CmsRecord"> | string
  }

  export type CmsCollectionCreateWithoutRecordsInput = {
    id?: string
    siteId: string
    name: string
    slug: string
    description?: string | null
    schemaDefinition?: JsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type CmsCollectionUncheckedCreateWithoutRecordsInput = {
    id?: string
    siteId: string
    name: string
    slug: string
    description?: string | null
    schemaDefinition?: JsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type CmsCollectionCreateOrConnectWithoutRecordsInput = {
    where: CmsCollectionWhereUniqueInput
    create: XOR<CmsCollectionCreateWithoutRecordsInput, CmsCollectionUncheckedCreateWithoutRecordsInput>
  }

  export type CmsCollectionUpsertWithoutRecordsInput = {
    update: XOR<CmsCollectionUpdateWithoutRecordsInput, CmsCollectionUncheckedUpdateWithoutRecordsInput>
    create: XOR<CmsCollectionCreateWithoutRecordsInput, CmsCollectionUncheckedCreateWithoutRecordsInput>
    where?: CmsCollectionWhereInput
  }

  export type CmsCollectionUpdateToOneWithWhereWithoutRecordsInput = {
    where?: CmsCollectionWhereInput
    data: XOR<CmsCollectionUpdateWithoutRecordsInput, CmsCollectionUncheckedUpdateWithoutRecordsInput>
  }

  export type CmsCollectionUpdateWithoutRecordsInput = {
    id?: StringFieldUpdateOperationsInput | string
    siteId?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    schemaDefinition?: JsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CmsCollectionUncheckedUpdateWithoutRecordsInput = {
    id?: StringFieldUpdateOperationsInput | string
    siteId?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    schemaDefinition?: JsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CmsRecordCreateManyCollectionInput = {
    id?: string
    data?: JsonNullValueInput | InputJsonValue
    createdBy: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type CmsRecordUpdateWithoutCollectionInput = {
    id?: StringFieldUpdateOperationsInput | string
    data?: JsonNullValueInput | InputJsonValue
    createdBy?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CmsRecordUncheckedUpdateWithoutCollectionInput = {
    id?: StringFieldUpdateOperationsInput | string
    data?: JsonNullValueInput | InputJsonValue
    createdBy?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CmsRecordUncheckedUpdateManyWithoutCollectionInput = {
    id?: StringFieldUpdateOperationsInput | string
    data?: JsonNullValueInput | InputJsonValue
    createdBy?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }



  /**
   * Batch Payload for updateMany & deleteMany & createMany
   */

  export type BatchPayload = {
    count: number
  }

  /**
   * DMMF
   */
  export const dmmf: runtime.BaseDMMF
}
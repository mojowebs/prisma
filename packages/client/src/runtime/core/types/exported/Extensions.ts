import { Sql } from 'sql-template-tag'

import { RequiredExtensionArgs as UserArgs } from './ExtensionArgs'
import { ITXClientDenyList } from './itxClientDenyList'
import { InputJsonObject, JsonObject } from './Json'
import { OperationPayload } from './Payload'
import { PrismaPromise } from './Public'
import { FluentOperation, GetFindResult, GetResult as GetOperationResult, Operation } from './Result'
import { TypedSql } from './TypedSql'
import { Call, ComputeDeep, Exact, Fn, Optional, Path, Return, Select, UnwrapTuple } from './Utils'

export type InternalArgs<
  R = { [K in string]: { [K in string]: unknown } },
  M = { [K in string]: { [K in string]: unknown } },
  Q = { [K in string]: { [K in string]: unknown } },
  C = { [K in string]: unknown },
> = {
  result: { [K in keyof R]: { [P in keyof R[K]]: () => R[K][P] } }
  model: { [K in keyof M]: { [P in keyof M[K]]: () => M[K][P] } }
  query: { [K in keyof Q]: { [P in keyof Q[K]]: () => Q[K][P] } }
  client: { [K in keyof C]: () => C[K] }
}

export type DefaultArgs = InternalArgs<{}, {}, {}, {}>

export declare type GetPayloadResultExtensionKeys<
  R extends InternalArgs['result'][string],
  KR extends keyof R = string extends keyof R ? never : keyof R,
> = KR

export declare type GetPayloadResultExtensionObject<R extends InternalArgs['result'][string]> = {
  [K in GetPayloadResultExtensionKeys<R>]: R[K] extends () => {
    compute: (...args: any) => infer C
  }
    ? C
    : never
}
export declare type GetPayloadResult<Base extends Record<any, any>, R extends InternalArgs['result'][string]> = Omit<
  Base,
  GetPayloadResultExtensionKeys<R>
> &
  GetPayloadResultExtensionObject<R>

export type GetSelect<
  Base extends Record<any, any>,
  R extends InternalArgs['result'][string],
  KR extends keyof R = string extends keyof R ? never : keyof R,
> = { [K in KR | keyof Base]?: K extends KR ? boolean : Base[K] }

export type GetOmit<BaseKeys extends string, R extends InternalArgs['result'][string]> = {
  [K in (string extends keyof R ? never : keyof R) | BaseKeys]?: boolean
}
/** Query */

// prettier-ignore
export type DynamicQueryExtensionArgs<
  Q_, 
  TypeMap extends TypeMapDef,
> = {
  [K in keyof Q_]:
    K extends '$allOperations'
    ? (args: { model?: string, operation: string, args: any, query: (args: any) => PrismaPromise<any> }) => Promise<any>
    : K extends '$allModels'
      ? {
          [P in keyof Q_[K] | keyof TypeMap['model'][keyof TypeMap['model']]['operations'] | '$allOperations']?:
            P extends '$allOperations'
            ? DynamicQueryExtensionCb<TypeMap, 'model', keyof TypeMap['model'], keyof TypeMap['model'][keyof TypeMap['model']]['operations']>
            : P extends keyof TypeMap['model'][keyof TypeMap['model']]['operations']
              ? DynamicQueryExtensionCb<TypeMap, 'model', keyof TypeMap['model'], P>
              : never
        }
      : K extends TypeMap['meta']['modelProps']
        ? {
            [P in keyof Q_[K] | keyof TypeMap['model'][ModelKey<TypeMap, K>]['operations'] | '$allOperations']?:
              P extends '$allOperations'
              ? DynamicQueryExtensionCb<TypeMap, 'model', ModelKey<TypeMap, K>, keyof TypeMap['model'][ModelKey<TypeMap, K>]['operations']>
              : P extends keyof TypeMap['model'][ModelKey<TypeMap, K>]['operations']
                ? DynamicQueryExtensionCb<TypeMap, 'model', ModelKey<TypeMap, K>, P>
                : never
          }
      : K extends keyof TypeMap['other']['operations']
        ? DynamicQueryExtensionCb<[TypeMap], 0 /* hack to maintain type arity */, 'other', K>
        : never
}

// prettier-ignore
export type DynamicQueryExtensionCb<
  TypeMap extends TypeMapDef,
  _0 extends PropertyKey,
  _1 extends PropertyKey,
  _2 extends PropertyKey,
> =
  <A extends DynamicQueryExtensionCbArgs<TypeMap, _0, _1, _2>>(args: A) =>
    Promise<TypeMap[_0][_1][_2]['result']>

// prettier-ignore
export type DynamicQueryExtensionCbArgs<
  TypeMap extends TypeMapDef,
  _0 extends PropertyKey,
  _1 extends PropertyKey,
  _2 extends PropertyKey,
> =
  ( // we distribute over the union of models and operations to allow narrowing
    _1 extends unknown ? _2 extends unknown ? {
      args: DynamicQueryExtensionCbArgsArgs<TypeMap, _0, _1, _2>,
      model: _0 extends 0 ? undefined : _1,
      operation: _2,
      query: <A extends DynamicQueryExtensionCbArgsArgs<TypeMap, _0, _1, _2>>(args: A) =>
        PrismaPromise<TypeMap[_0][_1]['operations'][_2]['result']>
    } : never : never
  ) & { // but we don't distribute for query so that the input types stay union
    query: (args: DynamicQueryExtensionCbArgsArgs<TypeMap, _0, _1, _2>) =>
      PrismaPromise<TypeMap[_0][_1]['operations'][_2]['result']>
  }

export type DynamicQueryExtensionCbArgsArgs<
  TypeMap extends TypeMapDef,
  _0 extends PropertyKey,
  _1 extends PropertyKey,
  _2 extends PropertyKey,
> = _2 extends '$queryRaw' | '$executeRaw'
  ? Sql // Override args type for raw queries
  : TypeMap[_0][_1]['operations'][_2]['args']

/** Result */

export type DynamicResultExtensionArgs<R_, TypeMap extends TypeMapDef> = {
  [K in keyof R_]: {
    [P in keyof R_[K]]?: {
      needs?: DynamicResultExtensionNeeds<TypeMap, ModelKey<TypeMap, K>, R_[K][P]>
      compute(data: DynamicResultExtensionData<TypeMap, ModelKey<TypeMap, K>, R_[K][P]>): any
    }
  }
}

export type DynamicResultExtensionNeeds<TypeMap extends TypeMapDef, M extends PropertyKey, S> = {
  [K in keyof S]: K extends keyof TypeMap['model'][M]['payload']['scalars'] ? S[K] : never
} & {
  [N in keyof TypeMap['model'][M]['payload']['scalars']]?: boolean
}

export type DynamicResultExtensionData<TypeMap extends TypeMapDef, M extends PropertyKey, S> = GetFindResult<
  TypeMap['model'][M]['payload'],
  { select: S },
  {}
>

/** Model */

// prettier-ignore
export type DynamicModelExtensionArgs<
  M_, 
  TypeMap extends TypeMapDef, 
  TypeMapCb extends TypeMapCbDef, 
  ExtArgs extends Record<string, any>,
  ClientOptions
> = {
  [K in keyof M_]:
    K extends '$allModels'
    ? & { [P in keyof M_[K]]?: unknown }
      & { [K: symbol]: {} }
    : K extends TypeMap['meta']['modelProps']
      ? & { [P in keyof M_[K]]?: unknown }
        & {
            [K: symbol]: {
              ctx: & DynamicModelExtensionThis<TypeMap, ModelKey<TypeMap, K>, ExtArgs, ClientOptions>
                   & { $parent: DynamicClientExtensionThis<TypeMap, TypeMapCb, ExtArgs, ClientOptions> } 
                   & { $name: ModelKey<TypeMap, K> }
                   & {
                      /**
                       * @deprecated Use `$name` instead.
                       */
                      name: ModelKey<TypeMap, K>
                    }
            }
          }
      : never
}

// prettier-ignore
export type DynamicModelExtensionThis<
  TypeMap extends TypeMapDef, 
  M extends PropertyKey, 
  ExtArgs extends Record<string, any>,
  ClientOptions
> = {
  [P in keyof ExtArgs['model'][Uncapitalize<M & string>]]:
    Return<ExtArgs['model'][Uncapitalize<M & string>][P]>
} & {
  [P in Exclude<keyof TypeMap['model'][M]['operations'], keyof ExtArgs['model'][Uncapitalize<M & string>]>]:
    DynamicModelExtensionOperationFn<TypeMap, M, P, ClientOptions>
} & {
  [P in Exclude<'fields', keyof ExtArgs['model'][Uncapitalize<M & string>]>]:
    TypeMap['model'][M]['fields'] 
} & {
  [K: symbol]: { types: TypeMap['model'][M] }
}

export type DynamicModelExtensionOperationFn<
  TypeMap extends TypeMapDef,
  M extends PropertyKey,
  P extends PropertyKey,
  ClientOptions,
> = {} extends TypeMap['model'][M]['operations'][P]['args'] // will match fully optional args
  ? <A extends TypeMap['model'][M]['operations'][P]['args']>(
      args?: Exact<A, TypeMap['model'][M]['operations'][P]['args']>,
    ) => DynamicModelExtensionFnResult<TypeMap, M, A, P, DynamicModelExtensionFnResultNull<P>, ClientOptions>
  : <A extends TypeMap['model'][M]['operations'][P]['args']>(
      args: Exact<A, TypeMap['model'][M]['operations'][P]['args']>,
    ) => DynamicModelExtensionFnResult<TypeMap, M, A, P, DynamicModelExtensionFnResultNull<P>, ClientOptions>

// prettier-ignore
export type DynamicModelExtensionFnResult<
  TypeMap extends TypeMapDef,
  M extends PropertyKey,
  A,
  P extends PropertyKey,
  Null,
  ClientOptions
> = P extends FluentOperation
  ? & DynamicModelExtensionFluentApi<TypeMap, M, P, Null, ClientOptions>
    & PrismaPromise<DynamicModelExtensionFnResultBase<TypeMap, M, A, P, ClientOptions> | Null>
  : PrismaPromise<DynamicModelExtensionFnResultBase<TypeMap, M, A, P, ClientOptions>>

export type DynamicModelExtensionFnResultBase<
  TypeMap extends TypeMapDef,
  M extends PropertyKey,
  A,
  P extends PropertyKey,
  ClientOptions,
> = GetOperationResult<TypeMap['model'][M]['payload'], A, P & Operation, ClientOptions>

// prettier-ignore
export type DynamicModelExtensionFluentApi<
  TypeMap extends TypeMapDef,
  M extends PropertyKey,
  P extends PropertyKey,
  Null,
  ClientOptions,
> = {
  [K in keyof TypeMap['model'][M]['payload']['objects']]: <A>(
    args?: Exact<A, Path<TypeMap['model'][M]['operations'][P]['args']['select'], [K]>>,
  ) => 
    & PrismaPromise<Path<DynamicModelExtensionFnResultBase<TypeMap, M, { select: { [P in K]: A } }, P, ClientOptions>, [K]> | Null>
    & DynamicModelExtensionFluentApi<
      TypeMap,
      (TypeMap['model'][M]['payload']['objects'][K] & {})['name'],
      P,
      Null | Select<TypeMap['model'][M]['payload']['objects'][K], null>,
      ClientOptions
    >
}

// prettier-ignore
export type DynamicModelExtensionFnResultNull<P extends PropertyKey> =
  P extends 'findUnique' | 'findFirst' ? null : never

/** Client */

export type DynamicClientExtensionArgs<
  C_,
  TypeMap extends TypeMapDef,
  TypeMapCb extends TypeMapCbDef,
  ExtArgs extends Record<string, any>,
  ClientOptions,
> = {
  [P in keyof C_]: unknown
} & {
  [K: symbol]: {
    ctx: Optional<DynamicClientExtensionThis<TypeMap, TypeMapCb, ExtArgs, ClientOptions>, ITXClientDenyList> & {
      $parent: Optional<DynamicClientExtensionThis<TypeMap, TypeMapCb, ExtArgs, ClientOptions>, ITXClientDenyList>
    }
  }
}

// prettier-ignore
export type DynamicClientExtensionThis<
  TypeMap extends TypeMapDef,
  TypeMapCb extends TypeMapCbDef,
  ExtArgs extends Record<string, any>,
  ClientOptions
> = {
  [P in keyof ExtArgs['client']]: Return<ExtArgs['client'][P]>
} & {
  [P in Exclude<TypeMap['meta']['modelProps'], keyof ExtArgs['client']>]:
    DynamicModelExtensionThis<TypeMap, ModelKey<TypeMap, P>, ExtArgs, ClientOptions>
} & {
  [P in Exclude<keyof TypeMap['other']['operations'], keyof ExtArgs['client']>]: P extends keyof ClientOtherOps ? ClientOtherOps[P] : never
} & {
  [P in Exclude<ClientBuiltInProp, keyof ExtArgs['client']>]:
    DynamicClientExtensionThisBuiltin<TypeMap, TypeMapCb, ExtArgs, ClientOptions>[P]
} & {
  [K: symbol]: { types: TypeMap['other'] }
}

export type ClientBuiltInProp = keyof DynamicClientExtensionThisBuiltin<never, never, never, never>

export type DynamicClientExtensionThisBuiltin<
  TypeMap extends TypeMapDef,
  TypeMapCb extends TypeMapCbDef,
  ExtArgs extends Record<string, any>,
  ClientOptions,
> = {
  $extends: ExtendsHook<'extends', TypeMapCb, ExtArgs, Call<TypeMapCb, { extArgs: ExtArgs }>, ClientOptions>
  $transaction<P extends PrismaPromise<any>[]>(
    arg: [...P],
    options?: { isolationLevel?: TypeMap['meta']['txIsolationLevel'] },
  ): Promise<UnwrapTuple<P>>
  $transaction<R>(
    fn: (
      client: Omit<DynamicClientExtensionThis<TypeMap, TypeMapCb, ExtArgs, ClientOptions>, ITXClientDenyList>,
    ) => Promise<R>,
    options?: { maxWait?: number; timeout?: number; isolationLevel?: TypeMap['meta']['txIsolationLevel'] },
  ): Promise<R>
  $disconnect(): Promise<void>
  $connect(): Promise<void>
}

/** $extends, defineExtension */

export interface ExtendsHook<
  Variant extends 'extends' | 'define',
  TypeMapCb extends TypeMapCbDef,
  ExtArgs extends Record<string, any>,
  TypeMap extends TypeMapDef = Call<TypeMapCb, { extArgs: ExtArgs }>,
  ClientOptions = {},
> {
  extArgs: ExtArgs
  <
    // X_ seeds the first fields for auto-completion and deals with dynamic inference
    // X doesn't deal with dynamic inference but captures the final inferred input type
    R_ extends { [K in TypeMap['meta']['modelProps'] | '$allModels']?: unknown },
    R,
    M_ extends { [K in TypeMap['meta']['modelProps'] | '$allModels']?: unknown },
    M,
    Q_ extends {
      [K in
        | TypeMap['meta']['modelProps']
        | '$allModels'
        | keyof TypeMap['other']['operations']
        | '$allOperations']?: unknown
    },
    C_ extends { [K in string]?: unknown },
    C,
    Args extends InternalArgs = InternalArgs<R, M, {}, C>,
    MergedArgs extends InternalArgs = MergeExtArgs<TypeMap, ExtArgs, Args>,
  >(
    extension:
      | ((client: DynamicClientExtensionThis<TypeMap, TypeMapCb, ExtArgs, ClientOptions>) => {
          $extends: { extArgs: Args }
        })
      | {
          name?: string
          query?: DynamicQueryExtensionArgs<Q_, TypeMap>
          result?: DynamicResultExtensionArgs<R_, TypeMap> & R
          model?: DynamicModelExtensionArgs<M_, TypeMap, TypeMapCb, ExtArgs, ClientOptions> & M
          client?: DynamicClientExtensionArgs<C_, TypeMap, TypeMapCb, ExtArgs, ClientOptions> & C
        },
  ): {
    extends: DynamicClientExtensionThis<Call<TypeMapCb, { extArgs: MergedArgs }>, TypeMapCb, MergedArgs, ClientOptions>
    define: (client: any) => { $extends: { extArgs: Args } }
  }[Variant]
}

export type MergeExtArgs<
  TypeMap extends TypeMapDef,
  ExtArgs extends Record<any, any>,
  Args extends Record<any, any>,
> = ComputeDeep<
  ExtArgs & Args & AllModelsToStringIndex<TypeMap, Args, 'result'> & AllModelsToStringIndex<TypeMap, Args, 'model'>
>

export type AllModelsToStringIndex<
  TypeMap extends TypeMapDef,
  Args extends Record<string, any>,
  K extends PropertyKey,
> = Args extends { [P in K]: { $allModels: infer AllModels } }
  ? { [P in K]: Record<TypeMap['meta']['modelProps'], AllModels> }
  : {}

/** Shared */

export type TypeMapDef = Record<any, any> /* DevTypeMapDef */

export type DevTypeMapDef = {
  meta: {
    modelProps: string
  }
  model: {
    [Model in PropertyKey]: {
      [Operation in PropertyKey]: DevTypeMapFnDef
    }
  }
  other: {
    [Operation in PropertyKey]: DevTypeMapFnDef
  }
}

export type DevTypeMapFnDef = {
  args: any
  result: any
  payload: OperationPayload
}

// TODO: move to result.ts
export type ClientOptionDef =
  | undefined
  | {
      [K in string]: any
    }

export type ClientOtherOps = {
  $queryRaw<T = unknown>(query: TemplateStringsArray | Sql, ...values: any[]): PrismaPromise<T>
  $queryRawTyped<T>(query: TypedSql<unknown[], T>): PrismaPromise<T[]>
  $queryRawUnsafe<T = unknown>(query: string, ...values: any[]): PrismaPromise<T>
  $executeRaw(query: TemplateStringsArray | Sql, ...values: any[]): PrismaPromise<number>
  $executeRawUnsafe(query: string, ...values: any[]): PrismaPromise<number>
  $runCommandRaw(command: InputJsonObject): PrismaPromise<JsonObject>
}

export type TypeMapCbDef = Fn<{ extArgs: InternalArgs; clientOptions: ClientOptionDef }, TypeMapDef>

export type ModelKey<TypeMap extends TypeMapDef, M extends PropertyKey> = M extends keyof TypeMap['model']
  ? M
  : Capitalize<M & string>

export type { UserArgs }

// TODO snippet for replacing PrismaClient text generated definition to reuse the full-dynamic type logic
// export class PrismaClient<
//   T extends Prisma.PrismaClientOptions = Prisma.PrismaClientOptions,
//   U = 'log' extends keyof T ? T['log'] extends Array<Prisma.LogLevel | Prisma.LogDefinition> ? Prisma.GetEvents<T['log']> : never : never,
// > {
//   constructor(options?: Prisma.Subset<T, Prisma.PrismaClientOptions>)
//   $on<V extends (U | 'beforeExit')>(eventType: V, callback: (event: V extends 'query' ? Prisma.QueryEvent : V extends 'beforeExit' ? () => Promise<void> : Prisma.LogEvent) => void): void;
//   $use(cb: Prisma.Middleware): void
//   ${metricDefinition.bind(this)()}
// }
// export interface PrismaClient<
//   T extends Prisma.PrismaClientOptions = Prisma.PrismaClientOptions,
//   U = 'log' extends keyof T ? T['log'] extends Array<Prisma.LogLevel | Prisma.LogDefinition> ? Prisma.GetEvents<T['log']> : never : never,
// > extends $Extensions.DynamicClientExtensionThis<Prisma.TypeMap, Prisma.TypeMapCb, $Extensions.DefaultArgs> {}

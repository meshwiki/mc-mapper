export type HistoGram<
    B extends string | number = string | number,
    D extends object = object
> = Record<B, D>;

type Updater<S> = {
    [K in keyof S]: (prev: S[K], prevStats: S) => S[K];
};

/**
 * histogram helper function to update stats in a functional way
 * @param bin
 * @param def
 * @returns
 */
export const histogram =
    <B extends string | number, S extends object>(bin: B, def: Updater<S>) =>
    (prevStats: HistoGram<B, S>) => {
        const newStats = prevStats[bin] ?? {};
        Object.keys(def).forEach((key) => {
            newStats[key as keyof S] = def[key as keyof S](
                newStats[key as keyof S],
                newStats
            );
        });
        return { ...prevStats, [bin]: newStats };
    };

import { HistoGram } from "@/lib/stats";

interface StatsTableProps<S extends object> {
    title?: string;
    bin?: string;
    stats: HistoGram<string | number, S>;
    columns: (keyof S)[];
}

/**
 * display a table of histogram data
 */
export function StatsTable<S extends object>({
    title,
    bin = "Bin",
    stats,
    columns,
}: StatsTableProps<S>) {
    return (
        <table className="w-full">
            <caption>{title}</caption>
            <thead>
                <tr>
                    <th>{bin}</th>
                    {columns.map((col) => (
                        <th key={col.toString()}>{col.toString()}</th>
                    ))}
                </tr>
            </thead>
            <tbody>
                {Object.keys(stats)
                    .sort((a, b) => parseInt(a) - parseInt(b))
                    .map((bin) => (
                        <tr key={bin}>
                            <td>{bin}</td>
                            {columns.map((col) => {
                                let val: any = stats[bin][col];
                                if (
                                    typeof val === "number" &&
                                    !Number.isInteger(val)
                                ) {
                                    val = val.toFixed(2);
                                }
                                return (
                                    <td key={col.toString()}>
                                        {val?.toString()}
                                    </td>
                                );
                            })}
                        </tr>
                    ))}
            </tbody>
        </table>
    );
}

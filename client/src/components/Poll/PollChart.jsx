import {
    Cell,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
} from "recharts";

const CHART_COLORS = [
    "#00E5FF",
    "#FF3366",
    "#FF9F1C",
    "#FFE047",
    "#39FF88",
    "#6C63FF",
    "#B14AED",
    "#FF4FD8",
    "#00C2FF",
    "#FF6B35",
];

const shuffleColors = (colors, seed) => {
    const shuffled = [...colors];
    let value = seed;


    for (let i = shuffled.length - 1; i > 0; i -= 1) {
        value = (value * 9301 + 49297) % 233280;
        const j = Math.floor((value / 233280) * (i + 1));

        [shuffled[i], shuffled[j]] = [
            shuffled[j],
            shuffled[i],
        ];
    }

    return shuffled;


};

const getPollSeed = (pollId) => {
    const value = String(pollId || "poll");


    return value
        .split("")
        .reduce(
            (total, character) =>
                (total * 31 + character.charCodeAt(0)) %
                233280,
            0,
        );


};

const PollChart = ({ poll }) => {
    if (!poll) {
        return null;
    }


    const options = Array.isArray(poll.options)
        ? poll.options
        : [];

    const chartColors = shuffleColors(
        CHART_COLORS,
        getPollSeed(poll._id),
    );

    const chartData = options.map(
        (option, index) => {
            const voteCount = Number(
                option.voteCount ||
                option.votes?.length ||
                0,
            );

            return {
                id: String(
                    option._id ||
                    option.id ||
                    index,
                ),
                name:
                    option.text ||
                    String(option),
                votes: Math.max(0, voteCount),
                color:
                    chartColors[
                    index %
                    chartColors.length
                    ],
            };
        },
    );

    const totalVotes = chartData.reduce(
        (total, option) =>
            total + option.votes,
        0,
    );

    const visibleData = chartData.filter(
        (option) => option.votes > 0,
    );

    const emptyData = [
        {
            id: "empty",
            name: "No votes",
            votes: 1,
            color: "#30372F",
        },
    ];

    const pieData =
        totalVotes > 0
            ? visibleData
            : emptyData;

    return (
        <div className="w-full">
            <div className="relative mx-auto h-[190px] w-full max-w-[270px]">
                <ResponsiveContainer
                    width="100%"
                    height="100%"
                >
                    <PieChart>
                        <Pie
                            data={pieData}
                            dataKey="votes"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            innerRadius={54}
                            outerRadius={79}
                            paddingAngle={
                                totalVotes > 0
                                    ? 3
                                    : 0
                            }
                            cornerRadius={
                                totalVotes > 0
                                    ? 5
                                    : 0
                            }
                            stroke="none"
                            startAngle={90}
                            endAngle={-270}
                            isAnimationActive={true}
                            animationDuration={550}
                        >
                            {pieData.map(
                                (entry) => (
                                    <Cell
                                        key={
                                            entry.id
                                        }
                                        fill={
                                            entry.color
                                        }
                                    />
                                ),
                            )}
                        </Pie>

                        {totalVotes > 0 ? (
                            <Tooltip
                                cursor={false}
                                contentStyle={{
                                    backgroundColor:
                                        "#101510",
                                    border:
                                        "1px solid #30382f",
                                    borderRadius:
                                        "10px",
                                    padding:
                                        "7px 9px",
                                    fontSize:
                                        "10px",
                                    boxShadow:
                                        "0 8px 24px rgba(0,0,0,0.35)",
                                }}
                                itemStyle={{
                                    color:
                                        "#edefe5",
                                }}
                                labelStyle={{
                                    color:
                                        "#9ca694",
                                    marginBottom:
                                        "2px",
                                }}
                                formatter={(
                                    value,
                                    name,
                                ) => [
                                        `${value} ${value === 1
                                            ? "vote"
                                            : "votes"
                                        }`,
                                        name,
                                    ]}
                            />
                        ) : null}
                    </PieChart>
                </ResponsiveContainer>

                <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-xl font-semibold leading-none text-[#f1f3ed]">
                        {totalVotes}
                    </span>

                    <span className="mt-1 text-[9px] font-medium uppercase tracking-[0.12em] text-[#7d8778]">
                        {totalVotes === 1
                            ? "vote"
                            : "votes"}
                    </span>
                </div>
            </div>

            <div className="mt-1.5 space-y-1.5">
                {chartData.map(
                    (option) => {
                        const percentage =
                            totalVotes > 0
                                ? Math.round(
                                    (option.votes /
                                        totalVotes) *
                                    100,
                                )
                                : 0;

                        return (
                            <div
                                key={option.id}
                                className="flex min-w-0 items-center gap-2"
                            >
                                <span
                                    className="h-2 w-2 shrink-0 rounded-full"
                                    style={{
                                        backgroundColor:
                                            option.color,
                                    }}
                                />

                                <span className="min-w-0 flex-1 truncate text-[11px] font-medium text-[#d9dfd4]">
                                    {option.name}
                                </span>

                                <span className="shrink-0 text-[10px] font-semibold text-[#8c9688]">
                                    {percentage}%
                                </span>
                            </div>
                        );
                    },
                )}
            </div>
        </div>
    );
};

export default PollChart;

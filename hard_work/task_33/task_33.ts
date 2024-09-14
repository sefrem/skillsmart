export enum PingStatusType {
    PLATFORM = 'PLATFORM',
    EXTERNAL = 'EXTERNAL',
}

export interface PingStatus {
    url: string;
    type: PingStatusType;
    timestamp: number;
    responseTime: number;
}

export interface PingStatistic {
    url: string;
    timeoutCnt: number;
    responsesCnt: number;
    min: number;
    max: number;
    avg: number;
    median: number;
    top10Worst: { timestamp: number; responseTime: number }[];
    last10Timeouts: string[];
}

export interface ParsedStats {
    pingStats: PingStatistic[];
    requestsCnt: number;
    pingTargetCnt: number;
}

interface TargetStats {
    responseTime: number,
    timestamp: number
}

// До - один большой метод parseStats, создающий объект нужного формата

class Before {
    private parseStats(stats: PingStatus[][]): ParsedStats | null {
        const requestsCnt = stats.length;
        const pingTargetCnt = stats[0]?.length;
        if (requestsCnt === 0 || pingTargetCnt === 0) {
            return null;
        }

        const pingStats: PingStatistic[] = [];
        for (let i = 0; i < pingTargetCnt; i++) {
            const targetStats = stats.map((stat) => ({
                responseTime: stat[i].responseTime,
                timestamp: stat[i].timestamp,
            }));
            const allResponseTimes = targetStats.map(({responseTime}) => responseTime).sort((a, b) => a - b);
            const responseTimes = allResponseTimes.filter((time) => time >= 0);
            const timeoutCnt = requestsCnt - responseTimes.length;
            const responsesCnt = responseTimes.length;
            const total = sum(responseTimes);
            const avg = responsesCnt > 0 ? Math.floor(total / responsesCnt) : -1;
            const median = Math.floor(
                requestsCnt % 2 === 0
                    ? (responseTimes[responsesCnt / 2] + responseTimes[responsesCnt / 2 - 1]) / 2
                    : responseTimes[responsesCnt / 2],
            );
            const min = responseTimes[0] ?? -1;
            const max = responseTimes[responsesCnt - 1] ?? -1;
            const url = stats[0][i].url;

            const last10Timeouts = targetStats
                .filter(({responseTime}) => responseTime === -1)
                .sort((a, b) => a.timestamp - b.timestamp)
                .slice(-10)
                .map(({timestamp}) => new Date(timestamp).toString());
            const top10Worst = targetStats
                .filter(({responseTime}) => responseTime >= 0)
                .sort((a, b) => a.responseTime - b.responseTime)
                .slice(-10);
            pingStats.push({
                url,
                timeoutCnt,
                responsesCnt,
                min,
                max,
                avg,
                median,
                top10Worst,
                last10Timeouts,
            });
        }

        return {
            pingStats,
            requestsCnt,
            pingTargetCnt,
        };
    }

}

// После
// Главный по сложности ключ - pingStats конструируется методом getPingStatsForParseStats, который рекурсивно
// обрабатыает массив stats

class After {
    private parseStats(stats: PingStatus[][]): ParsedStats | null {
        const requestsCnt = stats.length;
        const pingTargetCnt = stats[0]?.length;
        if (requestsCnt === 0 || pingTargetCnt === 0) {
            return null;
        }

        return {
            pingStats: this.getPingStatsForParseStats({stats, pingTargetCnt, requestsCnt, counter: 0}),
            requestsCnt,
            pingTargetCnt
        };
    }

    private getPingStatsForParseStats({stats, pingTargetCnt, requestsCnt, counter}: {
        stats: PingStatus[][],
        pingTargetCnt: number,
        requestsCnt: number,
        counter: number
    }): ParsedStats['pingStats'] {
        if (pingTargetCnt === counter) {
            return [];
        }

        return [this.constructPingStats({stats, counter, requestsCnt}),
            ...this.getPingStatsForParseStats({stats, pingTargetCnt, requestsCnt, counter: counter++})];
    }

    private constructPingStats({stats, counter, requestsCnt}: {
        stats: PingStatus[][],
        counter: number,
        requestsCnt: number,
    }): PingStatistic {
        const targetStats = this.getTargetStats(stats, counter);
        const responseTimes = targetStats.map(({responseTime}) => responseTime).sort((a, b) => a - b).filter((time) => time >= 0);

        return {
            url: this.getUrl(stats, counter),
            timeoutCnt: requestsCnt - responseTimes.length,
            responsesCnt: responseTimes.length,
            min: responseTimes[0] ?? -1,
            max: responseTimes[responseTimes.length - 1] ?? -1,
            avg: responseTimes.length > 0 ? Math.floor(sum(responseTimes) / responseTimes.length) : -1,
            median: this.getMedian(responseTimes),
            top10Worst: this.getTop10Worst(targetStats),
            last10Timeouts: this.getLast10Timeouts(targetStats)
        };
    }

    private getTargetStats(stats: PingStatus[][], counter: number): TargetStats[] {
        return stats.map((stat) => ({
            responseTime: stat[counter].responseTime,
            timestamp: stat[counter].timestamp
        }));
    }

    private getMedian(responseTimes: number[]): number {
        return Math.floor(
            responseTimes.length % 2 === 0
                ? (responseTimes[responseTimes.length / 2] + responseTimes[responseTimes.length / 2 - 1]) / 2
                : responseTimes[responseTimes.length / 2]
        );
    }

    private getUrl(stats: PingStatus[][], counter: number): string {
        return stats[0][counter].url;
    }

    private getTop10Worst(targetStats: TargetStats[]): TargetStats[] {
        return targetStats
            .filter(({responseTime}) => responseTime >= 0)
            .sort((a, b) => a.responseTime - b.responseTime)
            .slice(-10);
    }

    private getLast10Timeouts(targetStats: TargetStats[]): string[] {
        return targetStats
            .filter(({responseTime}) => responseTime === -1)
            .sort((a, b) => a.timestamp - b.timestamp)
            .slice(-10)
            .map(({timestamp}) => new Date(timestamp).toString());
    }

}
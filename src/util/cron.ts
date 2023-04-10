type CronOptions = {
    seconds?: number;
    minutes?: number;
    hours?: number;
    dayOfMonth?: number;
    month?: number;
    week?: number;
};

export function cronString(options: CronOptions, interval = true): string {
    if (!Object.keys(options).length) {
        throw TypeError('Cron intervals must be specified');
    }

    const allIntervals = {
        seconds: options.seconds,
        minutes: options.minutes,
        hours: options.hours,
        dayOfMonth: options.dayOfMonth,
        month: options.month,
        week: options.week,
    };

    const cs = interval ? intervalString(allIntervals) : nonIntervalString(allIntervals);
    console.log(cs);
    return cs;
}

function intervalString(options: CronOptions): string {
    const intervalList = Object.values(options).map(interval => (interval ? `*/${interval}` : '*'));
    return intervalList.join(' ');
}

function nonIntervalString(options: CronOptions): string {
    const intervalList = Object.values(options).map(interval => interval ?? '*');
    return intervalList.join(' ');
}

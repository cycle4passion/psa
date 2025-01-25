import type { Data, DataPoints } from "$lib/types";
import { differenceInYears } from "date-fns";
import type { PageServerLoad } from "./$types";
import { pivotLonger, pivotWider } from 'layerchart';

    type PsaAll = {
        psa: number,
        psadt: number,
        psavel: number,
        psaavg: number,
        date:Date
    }

    type Psa = {
        psa: number,
        date:Date
    }
export const load = (async () => {
    let data:Psa[] = [
        {
            psa: 0.4,
            date: new Date("2002-09-07T04:00:00.000Z"),
        },
        {
            psa: 1.2,
            date: new Date("2010-09-10T04:00:00.000Z"),
        },
        {
            psa: 3.4,
            date: new Date("2016-01-06T04:00:00.000Z"),
        },
        {
            psa: 9,
            date: new Date("2020-01-06T04:00:00.000Z"),
        },
        {
            psa: 12,
            date: new Date("2023-05-08T04:00:00.000Z"),
        },
        {
            psa: 35,
            date: new Date("2024-09-08T04:00:00.000Z"),
        },
    ].sort((a, b) => a.date.getTime() - b.date.getTime());

    const dataPoints: DataPoints[] = [
        {
            date: new Date("2006-01-06T04:00:00.000Z"),
            test: "TRUSBxPx",
            comment: "N/A",
        },
        {
            date: new Date("2012-02-06T04:00:00.000Z"),
            test: "Decipher",
            value: 9,
        },
        { date: new Date("2004-05-08T04:00:00.000Z"), test: "MRI", comment: "N/A" },
        {
            date: new Date("2020-07-08T04:00:00.000Z"),
            test: "Fusion TRUSBxPX",
            comment: "N/A",
        },
    ];

    const allpsas = addPSACalcs(data);
    // can't calcuate dt/vel for first data point, so copy the second data point to the first
    allpsas[0].psadt = allpsas[1].psadt;
    allpsas[0].psavel = allpsas[1].psavel;
    const keys = Object.keys(allpsas[0]).filter((key) => key !== "date");
    const longer = pivotLonger(allpsas, keys, 'psatype', 'value');
    data = pivotWider(longer, "date", "psatype", "value");

    return {
        data: data,
        points: dataPoints,
        keys:keys
    };
}) satisfies PageServerLoad;

function addPSACalcs(data: Data[]): PsaAll[] {
    let runningAvg;
    let lastone = data[0];

    function calcAverages(
        runningAvg: number = 0, value: number) {
        const avg = (runningAvg + value) / 2;
        return isFinite(avg) ? avg : 0;
    }

    function calcDoublingTime(
        date1: Date,
        value1: number,
        date2: Date,
        value2: number,
    ) {
        const diffTime = date2.getFullYear() - date1.getFullYear();
        const psaRatio = value2 / value1;
        const psadt = parseFloat((diffTime / Math.log(psaRatio)).toFixed(1));
        return isFinite(psadt) ? psadt : 0;
    }
    const calcVelocity = (
        time1: Date,
        value1: number,
        time2: Date,
        value2: number,
    ) => {
        const diffTime = differenceInYears(time2, time1);
        const diffValues = value2 - value1;
        /* avgVelocity = (time2-time1)/(value2-value1) */
        const vel = parseFloat((diffValues / diffTime).toFixed(1));
        return isFinite(vel) ? vel : 0;
    };


    return data.map((current) => {
        const { date: time2, psa: value2 } = current;
        const { date: time1, psa: value1 } = lastone;
        runningAvg = calcAverages(lastone.psaavg ?? value1, value2);
        lastone = current;
        return {
            date: time2,
            psa: value2,
            psavel: calcVelocity(time1, value1 as number, time2, value2 as number),
            psadt: calcDoublingTime(time1, value1 as number, time2, value2 as number),
            psaavg: runningAvg
        };
    });
}

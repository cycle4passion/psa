<!-- <svelte:options runes={true} /> -->

<script lang="ts">
	import { scaleTime, scaleSqrt } from "d3-scale";
	import { unique, trim0decimals } from "$lib/utils";
	import { curveCatmullRom } from "d3-shape";
	import { differenceInYears, subDays, format } from "date-fns";
	import {
		Axis,
		Brush,
		ChartClipPath,
		Labels,
		LinearGradient,
		Points,
		Rule,
		Spline,
		Text,
		LineChart,
		Tooltip,
		Point,
		Area,
		RectClipPath,
		Highlight,
		Group,
		Legend,
	} from "layerchart";
	import type { Data, DataPoints } from "$lib/types";
	import State from "$lib/components/State.svelte";
	import { popup } from "@skeletonlabs/skeleton";
	import type { PopupSettings } from "@skeletonlabs/skeleton";

	const popupPoints: PopupSettings = {
		// Represents the type of event that opens/closed the popup
		event: "hover",
		// Matches the data-popup value on your popup element
		target: "popupPoints",
		// Defines which side of your trigger the popup will appear
		placement: "bottom",
	};

	type Props = {
		psas: Data[];
		points: DataPoints[];
		show: {
			psa: boolean;
			psadt: boolean;
			psavel: boolean;
			psaavg: boolean;
			datapoints: boolean;
			years: number;
			sort: boolean;
		};
		keys: string[];
	};

	const errorRed = "rgb(255, 0, 0)";
	const series = [
		{
			key: "psa",
			label: "PSA",
			color: "rgb(var(--color-primary-500))",
			props: {
				threshold: 4,
				lowcolor: "rgb(var(--color-primary-500))",
				highcolor: errorRed,
				dashed: 0,
				labels: 100,
			},
		},
		{
			key: "psadt",
			label: "PSADT",
			color: "rgb(var(--color-secondary-500))",
			props: {
				threshold: 2,
				lowcolor: errorRed,
				highcolor: "rgb(var(--color-secondary-500))",
				dashed: 4,
				labels: 0,
			},
		},
		{
			key: "psavel",
			label: "PSAV",
			color: "rgb(var(--color-tertiary-500))",
			props: {
				threshold: 0.75,
				lowcolor: "rgb(var(--color-tertiary-500))",
				highcolor: errorRed,
				dashed: 6,
				labels: 0,
			},
		},
		{
			key: "psaavg",
			label: "PSA Avg",
			color: "rgb(var(--color-success-500))",
			props: {
				threshold: 0.75,
				lowcolor: "rgb(var(--color-success-500))",
				highcolor: errorRed,
				dashed: 8,
				labels: 0,
			},
		},
	];

	let { psas, points, show, keys }: Props = $props();
	console.log(psas);

	const padding = { left: 40, bottom: 50, right: 90, top: 0 };
	let xDomain = $derived([
		subDays(psas[psas.length - 1].date, show.years * 365),
		subDays(psas[psas.length - 1].date, 0),
	] as [Date, Date]);
</script>

<div class="w-full h-[calc(100vh*1/2)] p-2">
	<LineChart
		data={psas}
		x="date"
		{padding}
		xScale={scaleTime()}
		yScale={scaleSqrt()}
		xPadding={[16, 10]}
		yPadding={[0, 5]}
		grid={false}
		{xDomain}
		yDomain={[0, null]}
		props={{
			// spline: { curve: curveCatmullRom },
			points: {
				radius: 3,
				// fill: "white",
				// stroke: "rgb(var(--color-primary-500))",
			},
			yAxis: [
				{
					label: "PSA (ng/ml)",
					rule: { ticks: 2 },
				},
				// {
				// 	label: "PSA Velocity (ng/ml/yr)",
				// 	rule: { ticks: 2 },
				// 	placement: "right",
				// },
			],

			// tooltip: { header: format(date, "MMMM do yyyy") },
			// xAxis: {
			// 	label: "Date",
			// 	tickFormat: (d) => format(d, "yyyy"),
			// 	rule: { ticks: () => unique(psas.map((d) => d.date)) },
			// },
		}}
		{series}
		legend
		let:padding>
		<svelte:fragment
			slot="marks"
			let:visibleSeries
			let:getSplineProps
			let:yScale
			let:height
			let:width
			let:tooltip>
			{#each visibleSeries as s, i (s.key)}
				{@const thresholdOffset =
					(yScale(s.props.threshold) /
						(height + padding.bottom + padding.top)) *
						100 +
					"%"}
				{@const labels = s.props.labels}
				<LinearGradient
					stops={[
						[thresholdOffset, s.props.highcolor],
						[thresholdOffset, s.props.lowcolor],
					]}
					units="userSpaceOnUse"
					vertical
					let:gradient>
					<ChartClipPath>
						<Spline
							data={psas}
							y={s.key}
							class={`stroke-2`}
							stroke={gradient}
							{...getSplineProps(s, i)}
							curve={curveCatmullRom} />
						<!-- <Points fill={"white"} r={3} />
						<Labels
							dy={-6}
							dx={-6}
							format={(d) => (d == 0 ? "" : d)}
							class={`stroke-1 text-xs`}
							fill={s.props.labels ? s.props.color : "transparent"} />
						<LinearGradient
							class="from-primary-500/30 to-primary-500/0"
							vertical
							let:gradient>
							<RectClipPath
								x={0}
								y={0}
								width={tooltip.data ? tooltip.x : width}
								{height}
								spring>
								<Area
									line={{ class: "stroke-2 stroke-primary" }}
									fill={gradient}
									curve={curveCatmullRom} />
							</RectClipPath>
						</LinearGradient> -->
					</ChartClipPath>
				</LinearGradient>
			{/each}
		</svelte:fragment>
	</LineChart>
</div>

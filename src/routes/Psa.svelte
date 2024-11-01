<svelte:options runes={true} />

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
	} from "layerchart";
	import type { Data, DataPoints } from "$lib/types";
	import State from "$lib/components/State.svelte";

	type Props = {
		psas: Data[];
		points: DataPoints[];
		show: {
			psa: boolean;
			psadt: boolean;
			psavel: boolean;
			datapoints: boolean;
			years: number;
			sort: boolean;
		};
		keys: string[];
	};

	let { psas, points, show, keys }: Props = $props();
	const errorRed = "rgb(255, 0, 0)";
	const padding = { left: 40, bottom: 50, right: 90, top: 0 };
	let xDomain = $derived([
		subDays(psas[psas.length - 1].date, show.years * 365),
		subDays(psas[psas.length - 1].date, 0),
	] as [Date, Date]);
</script>

<div class="w-full h-full p-2">
	<State initial={[null, null]} let:set>
		<LineChart
			data={psas}
			x="date"
			{padding}
			xScale={scaleTime()}
			yScale={scaleSqrt()}
			xPadding={[16, 10]}
			grid={false}
			{xDomain}
			yDomain={[0, null]}
			series={[
				{
					key: "psa",
					color: "hsl(var(--color-primary-500))",
					props: {
						threshold: 4,
						lowcolor: "hsl(var(--color-primary-500))",
						highcolor: errorRed,
						dashed: 0,
					},
				},
				{
					key: "psadt",
					color: "hsl(var(--color-secondary-500))",
					props: {
						threshold: 2,
						lowcolor: errorRed,
						highcolor: "hsl(var(--color-secondary-500))",
						dashed: 4,
					},
				},
				{
					key: "psavel",
					color: "hsl(var(--color-tertiary-500))",
					props: {
						threshold: 0.75,
						lowcolor: "hsl(var(--color-tertiary-500))",
						highcolor: errorRed,
						dashed: 6,
					},
				},
			]}
			let:padding>
			<svelte:fragment slot="axis" let:width let:xScale let:yScale>
				<Axis
					placement="bottom"
					labelPlacement="middle"
					class="stroke-white"
					labelProps={{ dx: -50 }}
					tickLabelProps={{
						class: `stroke-transparent font-semibold fill-white`,
					}}
					rule />
				<Axis
					placement="left"
					label="PSA (ng/ml)"
					rule
					class="stroke-primary-500"
					labelProps={{
						class: "text-[14px] fill-primary-500 stroke-transparent",
					}}
					tickLabelProps={{
						class: `stroke-transparent font-semibold fill-primary-500`,
					}}
					ticks={(scale) => [4, ...scale.ticks?.()]} />
				{#if show.psa}
					<Rule
						y={4}
						class={`stroke-1 stroke-primary-500 opacity-45 [stroke-dasharray:6] [stroke-linecap:round]`} />
					<Text
						value="PSA 4.0"
						textAnchor="middle"
						verticalAnchor="start"
						y={yScale(4)}
						x={width / 2}
						class="fill-primary-500 text-[10px] opacity-35" />
				{/if}
				{#if show.psadt}
					<Axis
						placement="right"
						rule
						label="PSA Doubling Time (years)"
						labelPlacement="middle"
						tickLabelProps={{
							dx: 8,
							textAnchor: "start",
							class: `stroke-transparent font-semibold fill-secondary-500`,
						}}
						tickLength={6}
						labelProps={{
							dx: -50,
							class: "text-[14px] fill-secondary-500 stroke-transparent",
						}}
						class="stroke-secondary-500"
						format={(v) => (v.toFixed() === v ? v.toFixed() : v)}
						ticks={(scale) => unique([...scale.ticks?.(), 2])} />
					<Rule
						y={2}
						class="stroke-secondary-500 stroke-1 opacity-45 [stroke-dasharray:6] [stroke-linecap:round]" />
					<Text
						value="PSADT 2yrs"
						verticalAnchor="start"
						textAnchor="middle"
						y={yScale(2)}
						x={width / 2}
						class="fill-secondary-600 text-[10px] opacity-45" />
				{/if}
				{#if show.psavel}
					<Axis
						placement="right"
						rule
						label="PSA Velocity (ng/ml/year)"
						labelPlacement="middle"
						format={(v) => trim0decimals(v)}
						labelProps={{
							dx: -50,
							class: "text-[14px] fill-tertiary-500 stroke-transparent",
						}}
						tickLabelProps={{
							dx: 8,
							textAnchor: "start",
							class: `stroke-transparent font-semibold fill-tertiary-500`,
						}}
						ticks={(scale) => unique([0.75, ...scale.ticks?.()])}
						class={`stroke-tertiary-500 ${show.psadt ? "translate-x-[50px]" : ""}`} />
					<Rule
						y={0.75}
						class="stroke-primary-600 stroke-1 opacity-45 [stroke-dasharray:6] [stroke-linecap:round]" />
					<Text
						value="PSAV 0.75"
						textAnchor="middle"
						verticalAnchor="start"
						y={yScale(0.75)}
						x={width / 2}
						class="fill-tertiary-500 text-[10px] opacity-45" />
				{/if}
				{#if show.datapoints}
					{#each points as point}
						<Text
							value={point.test}
							textAnchor="end"
							verticalAnchor="start"
							x={xScale(point.date)}
							y={10}
							rotate={-90}
							class="fill-primary-500 opacity-40 text-xs" />
						<Rule
							x={point.date}
							class="stroke-primary-500 opacity-45 stroke-1 [stroke-dasharray:4] [stroke-linecap:round] " />
					{/each}
				{/if}
			</svelte:fragment>
			<svelte:fragment slot="marks" let:series let:yScale let:height>
				{#each series as s}
					{@const thresholdOffset =
						(yScale(s.props.threshold) /
							(height + padding.bottom + padding.top)) *
							100 +
						"%"}
					<LinearGradient
						stops={[
							[thresholdOffset, s.props.highcolor],
							[thresholdOffset, s.props.lowcolor],
						]}
						units="userSpaceOnUse"
						vertical
						let:url>
						{#if show[s.key as keyof typeof show]}
							<Labels
								dy={-6}
								dx={-6}
								class={"stroke-1 text-xs"}
								stroke={url}
								format={(d) => (d == 0 ? "" : d)} />
						{/if}
						<!-- <Point d={series[series.length - 1]} let:x let:y>
							<circle cx={x} cy={y} r={4} fill={url}></circle>
							<Text
							{x}
							{y}
							value={s.key}
							verticalAnchor="middle"
							dx={6}
							dy={-2}
							class="text-xs"
							fill={url} />
							</Point> -->
						<ChartClipPath>
							<Points stroke={url} r={2} />
							{#if show[s.key as keyof typeof show]}
								<Spline
									data={psas}
									y={s.key}
									class={`stroke-2 ${s.props.dashed ? `[stroke-dasharray:${s.props.dashed}] opacity-50` : ""}`}
									stroke={url}
									curve={curveCatmullRom} />
							{/if}
						</ChartClipPath>
					</LinearGradient>
				{/each}
				<Brush
					axis="x"
					resetOnEnd
					classes={{
						range: "fill-red-300/10",
						handle: "fill-red-500/50",
						frame: "stroke-transparent",
					}}
					on:brushEnd={(e) => {
						show.years = differenceInYears(
							// @ts-expect-error-next-line
							e.detail.xDomain[1],
							// @ts-expect-error-next-line
							e.detail.xDomain[0],
						);
						// @ts-expect-error-next-line
						set(e.detail.xDomain);
					}} />
			</svelte:fragment>
			<svelte:fragment slot="tooltip" let:series let:yScale let:height>
				<Tooltip.Root let:data>
					<Tooltip.Header>{format(data.date, "MMMM do yyyy")}</Tooltip.Header>
					<Tooltip.List>
						{#each keys as key}
							{@const units =
								key === "psa"
									? " ng/ml"
									: key === "psadt"
										? " years"
										: " ng/ml/year"}
							{#if show[key as keyof typeof show]}
								<Tooltip.Item
									label={key.toUpperCase()}
									value={data[key] + units} />
							{/if}
						{/each}
					</Tooltip.List>
				</Tooltip.Root>
			</svelte:fragment>
		</LineChart>
	</State>
</div>

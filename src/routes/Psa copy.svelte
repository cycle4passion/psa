<svelte:options runes={false} />

<script lang="ts">
	import { scaleTime, scaleSqrt } from "d3-scale";
	import { unique, trim0decimals } from "$lib/utils";
	import { curveCatmullRom } from "d3-shape";
	import { differenceInYears, format } from "date-fns";
	import {
		Area,
		Axis,
		Brush,
		Chart,
		ChartClipPath,
		Highlight,
		Labels,
		LinearGradient,
		Points,
		Rule,
		Spline,
		Svg,
		Text,
		Tooltip,
	} from "layerchart";
	import type { Data, DataPoints } from "$lib/types";
	import State from "$lib/components/State.svelte";

	export let psas: Data[];
	export let points: DataPoints[];
	export let xDomain: [Date, Date];
	export let showpsa: boolean;
	export let showdt: boolean;
	export let showvelocity: boolean;
	export let showdatapoints: boolean;
	export let years: number;

	const psadtColor = "hsl(270, 100%, 50%)";
	const psavelColor = "hsl(240, 100%, 50%)";
	const psaredColor = "hsl(0, 100%, 50%)";
	const psagreenColor = "hsl(120, 100%, 30%)";
	const padding = { left: 50, bottom: 50, right: 80, top: 50 };

	let charts = {
		area: {
			mode: "bisect-x",
			highlight: ["points", "lines"],
			axis: undefined,
			snapToDataX: false,
			snapToDataY: false,
			debug: false,
		},
	};
</script>

<div class="grid-stack gap-4 px-6 py-3 h-full overflow-visible">
	<State initial={[null, null]} let:set>
		<Chart
			data={psas}
			x="date"
			y="value"
			xScale={scaleTime()}
			yScale={scaleSqrt()}
			yDomain={[0, null]}
			{xDomain}
			yNice
			{padding}
			let:height
			let:width
			let:xScale
			let:yScale
			let:padding>
			{@const thresholdOffset =
				(yScale(4) / (height + padding.bottom + padding.top)) * 100 + "%"}
			<Svg class="stroke-primary-500 stroke-1">
				<!-- <Frame class="fill-tertiary-500/5" /> -->
				<Axis
					placement="left"
					label="PSA (ng/ml)"
					rule
					ticks={(scale) => [4, ...scale.ticks?.()]} />
				<Axis placement="bottom" labelPlacement="middle" rule />
				{#if showpsa}
					<Text
						value="4.0 PSA"
						textAnchor="middle"
						verticalAnchor="start"
						y={yScale(4)}
						x={width / 2}
						class="text-[10px] opacity-35" />
					<Rule
						y={4}
						class="stroke-grey-300 stroke-1 opacity-45 [stroke-dasharray:6] [stroke-linecap:round] " />
					<ChartClipPath>
						{#if showdatapoints}
							{#each points as point}
								<Text
									value={point.test}
									textAnchor="end"
									verticalAnchor="start"
									x={xScale(point.date)}
									y={10}
									rotate={-90}
									class="stroke-primary-500/50 text-xs" />
								<Rule
									x={point.date}
									class="stroke-primary-500 opacity-45 stroke-1 [stroke-dasharray:4] [stroke-linecap:round] " />
							{/each}
						{/if}
						<LinearGradient class="from-red-500" vertical let:url>
							<Area
								curve={curveCatmullRom}
								fill={url}
								tweened={{ duration: 200 }} />
						</LinearGradient>
						<LinearGradient
							stops={[
								[thresholdOffset, psaredColor],
								[thresholdOffset, psagreenColor],
							]}
							units="userSpaceOnUse"
							vertical
							let:url>
							<Spline
								curve={curveCatmullRom}
								class="stroke-2 fill-transparent"
								tweened={{ duration: 200 }}
								stroke={url} />
							<Points
								stroke={url}
								r={3}
								fill={"transparent"}
								tweened={{ duration: 200 }} />
						</LinearGradient>
						<Labels
							dy={-6}
							dx={-10}
							format={(d) => (d == 0 ? "" : d)}
							tweened={{ duration: 200 }} />
					</ChartClipPath>
				{/if}
				<Highlight points lines />
			</Svg>
		</Chart>
		<Chart
			data={psas}
			x="date"
			y="psadt"
			xScale={scaleTime()}
			yScale={scaleSqrt()}
			{xDomain}
			yDomain={[0, null]}
			yNice
			{padding}
			let:height
			let:yScale
			let:padding
			let:width>
			{@const thresholdOffset =
				(yScale(2) / (height + padding.bottom + padding.top)) * 100 + "%"}
			<Svg class="stroke-gray-300 stroke-1">
				{#if showdt}
					<Axis
						placement="right"
						rule
						label="PSA Doubling Time (years)"
						labelPlacement="middle"
						tickLabelProps={{ dx: 8, textAnchor: "start" }}
						tickLength={6}
						labelProps={{ dx: -50 }}
						class="stroke-purple-600"
						format={(v) => (v.toFixed() === v ? v.toFixed() : v)}
						ticks={(scale) => unique([...scale.ticks?.(), 2])} />
					<Rule
						y={2}
						class="stroke-purple-600 stroke-1 opacity-45 [stroke-dasharray:6] [stroke-linecap:round]" />
					<Text
						value="2yr PSADT"
						verticalAnchor="start"
						textAnchor="middle"
						y={yScale(2)}
						x={width / 2}
						class="stroke-purple-600 text-[10px] opacity-45" />
					<ChartClipPath>
						<LinearGradient
							stops={[
								[thresholdOffset, psadtColor],
								[thresholdOffset, psaredColor],
							]}
							units="userSpaceOnUse"
							vertical
							let:url>
							<Points
								stroke={url}
								r={3}
								fill={"transparent"}
								tweened={{ duration: 200 }} />
							<Spline
								curve={curveCatmullRom}
								class="stroke-1 [stroke-dasharray:4] [stroke-linecap:round] fill-transparent"
								tweened={{ duration: 200 }}
								stroke={url}>
								<svelte:fragment slot="start">
									<Text
										value="PSADT"
										anchor="top"
										verticalAnchor="middle"
										dx={6}
										dy={-10}
										class="fill-purple-600 text-xs" />
								</svelte:fragment>
							</Spline>
						</LinearGradient>
					</ChartClipPath>
					<Highlight lines points />
				{/if}
			</Svg>
		</Chart>

		<Chart
			data={psas}
			x="date"
			y="psavel"
			xScale={scaleTime()}
			yScale={scaleSqrt()}
			{xDomain}
			yNice
			{padding}
			tooltip={{
				mode: "bisect-x",
				debug: false,
			}}
			let:height
			let:yScale
			let:padding
			let:width>
			{@const thresholdOffset =
				(yScale(0.75) / (height + padding.bottom + padding.top)) * 100 + "%"}
			<Svg class="stroke-gray-300 stroke-1">
				{#if showvelocity}
					<Axis
						placement="right"
						rule
						label="PSA Velocity (ng/ml/year)"
						labelPlacement="middle"
						format={(v) => trim0decimals(v)}
						labelProps={{ dx: -50 }}
						ticks={(scale) => unique([0.75, ...scale.ticks?.()])}
						class="translate-x-[50px] stroke-blue-700" />

					<Rule
						y={0.75}
						class="stroke-blue-600 stroke-1 opacity-45 [stroke-dasharray:6] [stroke-linecap:round]" />
					<Text
						value="0.75 PSAV"
						textAnchor="middle"
						verticalAnchor="start"
						y={yScale(0.75)}
						x={width / 2}
						class="stroke-blue-600 text-[10px] opacity-45" />
					<ChartClipPath>
						<LinearGradient
							stops={[
								[thresholdOffset, psaredColor],
								[thresholdOffset, psavelColor],
							]}
							units="userSpaceOnUse"
							vertical
							let:url>
							<Points
								stroke={url}
								r={3}
								fill={"transparent"}
								tweened={{ duration: 200 }} />
							<Spline
								curve={curveCatmullRom}
								class="stroke-1 [stroke-dasharray:4] [stroke-linecap:round] fill-transparent"
								tweened={{ duration: 200 }}
								stroke={url}>
								<svelte:fragment slot="start">
									<Text
										value="PSAV"
										verticalAnchor="middle"
										dx={8}
										dy={-12}
										class="fill-blue-600 text-xs" />
								</svelte:fragment>
							</Spline>
						</LinearGradient>
					</ChartClipPath>
					<Highlight lines points />
				{/if}
				<Brush
					axis="x"
					resetOnEnd
					classes={{
						range: "fill-red-300/10",
						handle: "fill-red-500/50",
						frame: "stroke-transparent",
					}}
					on:brushEnd={(e) => {
						years = differenceInYears(
							// @ts-expect-error-next-line
							e.detail.xDomain[1],
							// @ts-expect-error-next-line
							e.detail.xDomain[0],
						);
						// @ts-expect-error
						set(e.detail.xDomain);
					}} />
			</Svg>
			<!-- <Tooltip.Root let:data>
				<Tooltip.Header>{format(data.date, "eee, MMMM do")}</Tooltip.Header>
				<Tooltip.List>
					<Tooltip.Item label="value" value={data.value} />
				</Tooltip.List>
			</Tooltip.Root> -->

			<Tooltip.Root
				xOffset={4}
				x={charts.area.snapToDataX ? "data" : "pointer"}
				y={charts.area.snapToDataY ? "data" : "pointer"}
				class="text-sm font-semibold text-primary leading-3 bg-surface-100/80 backdrop-blur-sm px-2 py-1 rounded"
				let:data>
				<Tooltip.Header>{format(data.date, "MMMM do yyyy")}</Tooltip.Header>
				<Tooltip.List>
					{#each ["value", "psavel", "psadt"] as key}
						<Tooltip.Item label={key} value={data[key]} />
					{/each}
				</Tooltip.List>
				{data.value}
			</Tooltip.Root>
			<!-- <Tooltip.Root
				y="data"
				xOffset={4}
				anchor="bottom"
				variant="none"
				class="text-sm font-semibold text-primary leading-3 bg-surface-100/80 backdrop-blur-sm px-2 py-1 rounded"
				let:data>
				{format(data.psadt, "0.0")}
			</Tooltip.Root>
			<Tooltip.Root
				y="data"
				xOffset={4}
				anchor="bottom"
				variant="none"
				class="text-sm font-semibold text-primary leading-3 bg-surface-100/80 backdrop-blur-sm px-2 py-1 rounded"
				let:data>
				{format(data.psavel, "0.0")}
			</Tooltip.Root>
			<Tooltip.Root
				x="data"
				y={height + padding.top}
				yOffset={2}
				anchor="top"
				variant="none"
				class="text-sm font-semibold bg-primary text-primary-content leading-3 px-2 py-1 rounded whitespace-nowrap"
				let:data>
				{format(data.date, "MM/dd/yy")}
			</Tooltip.Root> -->

			<!-- <Tooltip.Root
				x="data"
				y={height + padding.top}
				yOffset={2}
				anchor="top"
				variant="none"
				class="text-sm font-semibold bg-primary text-primary-content leading-3 px-2 py-1 rounded whitespace-nowrap"
				let:data>
				{format(data.date, "MM/dd/yyyy")}
			</Tooltip.Root> -->
		</Chart>
	</State>
</div>
<!--<State initial={[null, null]} let:set>
		<Chart
			data={psas}
			x="date"
			y="value"
			xScale={scaleTime()}
			yScale={scaleSqrt()}
			yDomain={[0, null]}
			{xDomain}
			yNice
			{padding}
			let:height
			let:width
			let:xScale
			let:yScale
			let:padding
			let:cGet>
			{@const thresholdOffset =
				(yScale(4) / (height + padding.bottom + padding.top)) * 100 + "%"}
			<Svg class="stroke-primary-500 stroke-1">
				{#if show.psa}
					<Axis
						placement="left"
						label="PSA (ng/ml)"
						rule
						ticks={(scale) => [4, ...scale.ticks?.()]} />
				{/if}
				<Axis placement="bottom" labelPlacement="middle" rule />
				{#if show.dt}
					<Axis
						placement="right"
						rule
						label="PSA Doubling Time (years)"
						labelPlacement="middle"
						tickLabelProps={{ dx: 8, textAnchor: "start" }}
						tickLength={6}
						labelProps={{ dx: -50 }}
						class="stroke-purple-600"
						format={(v) => (v.toFixed() === v ? v.toFixed() : v)}
						ticks={(scale) => unique([...scale.ticks?.(), 2])} />
					<Rule
						y={2}
						class="stroke-purple-600 stroke-1 opacity-45 [stroke-dasharray:6] [stroke-linecap:round]" />
					<Text
						value="2yr PSADT"
						verticalAnchor="start"
						textAnchor="middle"
						y={yScale(2)}
						x={width / 2}
						class="stroke-purple-600 text-[10px] opacity-45" />
				{/if}
				{#if show.velocity}
					<Axis
						placement="right"
						rule
						label="PSA Velocity (ng/ml/year)"
						labelPlacement="middle"
						format={(v) => trim0decimals(v)}
						labelProps={{ dx: -50 }}
						ticks={(scale) => unique([0.75, ...scale.ticks?.()])}
						class="translate-x-[50px] stroke-blue-700" />
					<Rule
						y={0.75}
						class="stroke-blue-600 stroke-1 opacity-45 [stroke-dasharray:6] [stroke-linecap:round]" />
					<Text
						value="0.75 PSAV"
						textAnchor="middle"
						verticalAnchor="start"
						y={yScale(0.75)}
						x={width / 2}
						class="stroke-blue-600 text-[10px] opacity-45" />
				{/if}
				{#if show.psa}
					<Text
						value="4.0 PSA"
						textAnchor="middle"
						verticalAnchor="start"
						y={yScale(4)}
						x={width / 2}
						class="text-[10px] opacity-35" />
					<Rule
						y={4}
						class="stroke-grey-300 stroke-1 opacity-45 [stroke-dasharray:6] [stroke-linecap:round] " />
				{/if}
				<ChartClipPath>
					{#if show.datapoints}
						{#each points as point}
							<Text
								value={point.test}
								textAnchor="end"
								verticalAnchor="start"
								x={xScale(point.date)}
								y={10}
								rotate={-90}
								class="stroke-primary-500/50 text-xs" />
							<Rule
								x={point.date}
								class="stroke-primary-500 opacity-45 stroke-1 [stroke-dasharray:4] [stroke-linecap:round] " />
						{/each}
					{/if}
					<!~~ <LinearGradient class="from-red-500" vertical let:url>
							<Area
								curve={curveCatmullRom}
								fill={url}
								tweened={{ duration: 200 }} />
						</LinearGradient> ~~>
					<LinearGradient
						stops={[
							[thresholdOffset, psaredColor],
							[thresholdOffset, psagreenColor],
						]}
						units="userSpaceOnUse"
						vertical
						let:url>
						{#each psas as seriesData}
							<!~~ {#if show[seriesData]} ~~>
							{@const color = cGet(seriesData)}
							<Area
								data={seriesData}
								line={{ stroke: color, "stroke-width": 2 }}
								fill={color}
								fill-opacity={0.2} />
							<!~~ <Spline
								curve={curveCatmullRom}
								class="stroke-2 fill-transparent"
								tweened={{ duration: 200 }}
								stroke={url} /> ~~>
							<Points
								stroke={url}
								r={3}
								fill={"transparent"}
								tweened={{ duration: 200 }} />
							<!~~ {/if} ~~>
						{/each}
					</LinearGradient>
					<Labels
						dy={-6}
						dx={-10}
						format={(d) => (d == 0 ? "" : d)}
						tweened={{ duration: 200 }} />
				</ChartClipPath>
				<Highlight points lines />
			</Svg>
		</Chart>-->

<!--		<Chart
			data={psas}
			x="date"
			y="psadt"
			xScale={scaleTime()}
			yScale={scaleSqrt()}
			{xDomain}
			yDomain={[0, null]}
			yNice
			{padding}
			let:height
			let:yScale
			let:padding
			let:width>
			{@const thresholdOffset =
				(yScale(2) / (height + padding.bottom + padding.top)) * 100 + "%"}
			<Svg class="stroke-gray-300 stroke-1">
			
			</Svg>
		</Chart>

		<Chart
			data={psas}
			x="date"
			y="psavel"
			xScale={scaleTime()}
			yScale={scaleSqrt()}
			{xDomain}
			yNice
			{padding}
			tooltip={{
				mode: "bisect-x",
				debug: false,
			}}
			let:height
			let:yScale
			let:padding
			let:width>
			{@const thresholdOffset =
				(yScale(0.75) / (height + padding.bottom + padding.top)) * 100 + "%"}
			<Svg class="stroke-gray-300 stroke-1">
				{#if showvelocity}
					<Axis
						placement="right"
						rule
						label="PSA Velocity (ng/ml/year)"
						labelPlacement="middle"
						format={(v) => trim0decimals(v)}
						labelProps={{ dx: -50 }}
						ticks={(scale) => unique([0.75, ...scale.ticks?.()])}
						class="translate-x-[50px] stroke-blue-700" />

					<Rule
						y={0.75}
						class="stroke-blue-600 stroke-1 opacity-45 [stroke-dasharray:6] [stroke-linecap:round]" />
					<Text
						value="0.75 PSAV"
						textAnchor="middle"
						verticalAnchor="start"
						y={yScale(0.75)}
						x={width / 2}
						class="stroke-blue-600 text-[10px] opacity-45" />
					<ChartClipPath>
						<LinearGradient
							stops={[
								[thresholdOffset, psaredColor],
								[thresholdOffset, psavelColor],
							]}
							units="userSpaceOnUse"
							vertical
							let:url>
							<Points
								stroke={url}
								r={3}
								fill={"transparent"}
								tweened={{ duration: 200 }} />
							<Spline
								curve={curveCatmullRom}
								class="stroke-1 [stroke-dasharray:4] [stroke-linecap:round] fill-transparent"
								tweened={{ duration: 200 }}
								stroke={url}>
								<svelte:fragment slot="start">
									<Text
										value="PSAV"
										verticalAnchor="middle"
										dx={8}
										dy={-12}
										class="fill-blue-600 text-xs" />
								</svelte:fragment>
							</Spline>
						</LinearGradient>
					</ChartClipPath>
					<Highlight lines points />
				{/if}
				<Brush
					axis="x"
					resetOnEnd
					classes={{
						range: "fill-red-300/10",
						handle: "fill-red-500/50",
						frame: "stroke-transparent",
					}}
					on:brushEnd={(e) => {
						years = differenceInYears(
							// @ts-expect-error-next-line
							e.detail.xDomain[1],
							// @ts-expect-error-next-line
							e.detail.xDomain[0],
						);
						// @ts-expect-error
						set(e.detail.xDomain);
					}} />
			</Svg>
			<!~~ <Tooltip.Root let:data>
				<Tooltip.Header>{format(data.date, "eee, MMMM do")}</Tooltip.Header>
				<Tooltip.List>
					<Tooltip.Item label="value" value={data.value} />
				</Tooltip.List>
			</Tooltip.Root> ~~>

			<Tooltip.Root
				xOffset={4}
				x={charts.area.snapToDataX ? "data" : "pointer"}
				y={charts.area.snapToDataY ? "data" : "pointer"}
				class="text-sm font-semibold text-primary leading-3 bg-surface-100/80 backdrop-blur-sm px-2 py-1 rounded"
				let:data>
				<Tooltip.Header>{format(data.date, "MMMM do yyyy")}</Tooltip.Header>
				<Tooltip.List>
					{#each ["value", "psavel", "psadt"] as key}
						<Tooltip.Item label={key} value={data[key]} />
					{/each}
				</Tooltip.List>
				{data.value}
			</Tooltip.Root>
			<!~~ <Tooltip.Root
				y="data"
				xOffset={4}
				anchor="bottom"
				variant="none"
				class="text-sm font-semibold text-primary leading-3 bg-surface-100/80 backdrop-blur-sm px-2 py-1 rounded"
				let:data>
				{format(data.psadt, "0.0")}
			</Tooltip.Root>
			<Tooltip.Root
				y="data"
				xOffset={4}
				anchor="bottom"
				variant="none"
				class="text-sm font-semibold text-primary leading-3 bg-surface-100/80 backdrop-blur-sm px-2 py-1 rounded"
				let:data>
				{format(data.psavel, "0.0")}
			</Tooltip.Root>
			<Tooltip.Root
				x="data"
				y={height + padding.top}
				yOffset={2}
				anchor="top"
				variant="none"
				class="text-sm font-semibold bg-primary text-primary-content leading-3 px-2 py-1 rounded whitespace-nowrap"
				let:data>
				{format(data.date, "MM/dd/yy")}
			</Tooltip.Root> ~~>

			<!~~ <Tooltip.Root
				x="data"
				y={height + padding.top}
				yOffset={2}
				anchor="top"
				variant="none"
				class="text-sm font-semibold bg-primary text-primary-content leading-3 px-2 py-1 rounded whitespace-nowrap"
				let:data>
				{format(data.date, "MM/dd/yyyy")}
			</Tooltip.Root> ~~>
		</Chart> -->
<!-- </State> -->

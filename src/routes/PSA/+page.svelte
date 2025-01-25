<script lang="ts">
	import { flip } from "svelte/animate";
	import { quintOut } from "svelte/easing";
	import { differenceInYears, format } from "date-fns";
	import type { DataPoints } from "$lib/types";
	import { prefs } from "$lib/persisted";
	import { popup } from "@skeletonlabs/skeleton";
	import type { PopupSettings } from "@skeletonlabs/skeleton";
	import PSA from "./Psa.svelte";

	let { data } = $props();
	let { data: psas, points, keys } = data;
	let tooltip: HTMLSpanElement;
	let range: HTMLInputElement;

	let maxyears = Math.round(
		differenceInYears(psas[psas.length - 1].date, psas[0].date),
	);

	let show = $state({
		psa: $prefs.psa.psa,
		psadt: $prefs.psa.psadt,
		psavel: $prefs.psa.psavel,
		psaavg: $prefs.psa.psaavg,
		datapoints: $prefs.psa.points,
		years: $prefs.psa.years !== -1 ? Number($prefs.psa.years) : maxyears,
		sort: $prefs.psa.sort,
	});

	let displayDataText: DataPoints[] = $derived.by(() => {
		const arrayToSort = show.datapoints ? [...psas, ...points] : [...psas];
		return arrayToSort.sort((a, b) =>
			show.sort
				? a.date.getTime() - b.date.getTime()
				: b.date.getTime() - a.date.getTime(),
		);
	});

	function saveData() {
		prefs.set({
			psa: {
				psa: show.psa,
				psadt: show.psadt,
				psavel: show.psavel,
				psaavg: show.psaavg,
				points: show.datapoints,
				years: show.years,
				sort: show.sort,
			},
		});
	}

	function updateTooltip() {
		const { value, min, max } = range;
		const percent =
			((Number(value) - Number(min)) / (Number(max) - Number(min))) * 100;
		tooltip.style.left = `calc(${percent}% + (${8 - percent * 0.15}px))`;
	}
	// $effect(() => updateTooltip());
</script>

<div class="mx-auto w-full flex flex-col gap-4 p-4">
	<h1 class="text-3xl text-center pb-6">
		Prostate Specific Antigen (PSA) History
	</h1>
	<div class="flex items-center gap-5 print:hidden">
		<span class="font-bold">Show:</span>
		<label for="psa" class="flex gap-2"
			><input
				id="psa"
				class="checkbox"
				type="checkbox"
				bind:checked={show.psa} />PSA</label>
		<label for="dt" class="flex gap-2"
			><input
				id="dt"
				class="checkbox"
				type="checkbox"
				bind:checked={show.psadt} />
			Doubling Time</label>
		<label for="vel" class="flex gap-2"
			><input
				id="vel"
				class="checkbox"
				type="checkbox"
				bind:checked={show.psavel} /> Velocity</label>
		<label for="avg" class="flex gap-2"
			><input
				id="avg"
				class="checkbox"
				type="checkbox"
				bind:checked={show.psaavg} /> Average</label>
		<label for="datapoints" class="flex gap-2"
			><input
				id="datapoints"
				class="checkbox"
				type="checkbox"
				bind:checked={show.datapoints} />
			Data Points (Biopsies, MRIs, etc)</label>

		<button
			type="button"
			class="btn btn-sm variant-ringed-primary ml-auto rounded-full hover:variant-filled-primary px-4"
			onclick={saveData}>Save</button>
		<button
			type="button"
			class="btn btn-sm variant-ringed-primary rounded-full hover:variant-filled-primary px-4"
			onclick={() => window.print()}>Print</button>
	</div>
	<div class="no-print relative mx-10 mt-10">
		<input
			bind:this={range}
			type="range"
			min="1"
			max={maxyears}
			step="0.5"
			oninput={updateTooltip}
			class="range bg-surface-500 relative w-full h-[15px] rounded-xl appearance-none"
			bind:value={show.years} />
		<span
			id="tooltip"
			class="z-3 absolute -top-10 left-1/2 -translate-x-1/2 transform whitespace-nowrap rounded-full bg-surface-500 px-3 py-2 text-xs text-white"
			bind:this={tooltip}>{show.years} Year{show.years !== 1 ? "s" : ""}</span>
	</div>
	<PSA {psas} {points} {keys} {show} />
	<div class="flex mx-14 flex-col">
		<div
			class="flex items-center gap-2 text-lg font-bold pb-1 text-primary-500">
			<span class="underline">PSA HISTORY </span>
			<button
				class="arrow no-print hover:text-white"
				class:ascending={show.sort}
				onclick={() => (show.sort = !show.sort)}>↓</button>
		</div>
		{#each displayDataText as display (display)}
			<div
				class="flex gap-2"
				animate:flip={{ delay: 250, duration: 250, easing: quintOut }}>
				<div class="w-[85px] text-right">
					{format(display.date, "MM/dd/yyyy")}
				</div>
				{#if display.psa}
					PSA {display.psa} ng/ml
					{#if display.date === new Date()}
						⇦ Today
					{/if}
				{:else}
					<button
						class="hover:underline"
						popovertarget="details"
						name="anchor-position">
						---&gt; {display.test}
						{display.comment !== "N/A" ? `(${display.value})` : ""}
					</button>
					<div id="details" popover="manual">{display.comment}</div>
				{/if}
			</div>
		{/each}
	</div>
</div>

<style>
	.arrow {
		transition: transform 0.2s ease-in-out;
		&.ascending {
			transform: rotate(180deg);
		}
	}

	input[type="range"]::-webkit-slider-thumb {
		@apply appearance-none w-[23px] h-[23px] rounded-full bg-primary-500 cursor-pointer relative;
	}

	input[type="range"]::-moz-range-thumb {
		@apply w-[23px] h-[23px] rounded-full bg-primary-500 cursor-pointer relative;
	}

	button {
		anchor-name: --anchor-btn;
		/* 
		font-size: 1rem;
		border-radius: 2rem;
		height: 2rem;
		width: 2rem;
		display: grid;
		border: 2px solid black;
		place-content: center; */
	}

	[popover] {
		--tether-offset: 1px;
		--tether-size: 8px;

		position-anchor: --anchor-btn;
		position: absolute;
		position-area: top;
		position-try: --bottom, --left, --right;

		margin: 0 0 var(--tether-size) 0;
		clip-path: inset(var(--tether-offset)) margin-box;

		/* need this to see the tether */
		overflow: visible;

		max-width: 300px;

		background: black;
		color: white;
		border: none;
		padding: 1rem;
		border-radius: 1rem;

		&::before {
			content: "";
			position: absolute;
			z-index: -1;
			inset: calc(-1 * var(--tether-size)) calc(50% - var(--tether-size));
			background: inherit;
			clip-path: polygon(
				0 var(--tether-size),
				50% 0,
				100% var(--tether-size),
				100% calc(100% - var(--tether-size)),
				50% 100%,
				0 calc(100% - var(--tether-size))
			);
		}

		&::after {
			content: "";
			position: absolute;
			z-index: -1;
			inset: calc(50% - var(--tether-size)) calc(-1 * var(--tether-size));
			background: inherit;
			clip-path: polygon(
				0 var(--tether-size),
				var(--tether-size) 0,
				calc(100% - var(--tether-size)) 0,
				100% 50%,
				calc(100% - var(--tether-size)) 100%,
				var(--tether-size) 100%
			);
		}
	}

	@position-try --bottom {
		position-area: bottom;
		margin: 0.5rem 0 0 0;
	}
	@position-try --left {
		position-area: left;
		margin: 0 0.5rem 0 0;
	}
	@position-try --right {
		position-area: right;
		margin: 0 0 0 0.5rem;
	}
</style>

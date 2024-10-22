<svelte:options runes={true} />

<script lang="ts">
	import { flip } from "svelte/animate";
	import { quintOut } from "svelte/easing";
	import Psa from "./Psa.svelte";
	import { differenceInYears, format } from "date-fns";
	import type { DataPoints } from "$lib/types";
	import { prefs } from "$lib/persisted";

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
		datapoints: $prefs.psa.points,
		years: $prefs.psa.years !== -1 ? Number($prefs.psa.years) : maxyears,
		sort: $prefs.psa.sort,
	});

	let displayDataText: DataPoints[] = $derived.by(() =>
		(show.datapoints ? [...psas, ...points] : psas).sort((a, b) =>
			show.sort
				? a.date.getTime() - b.date.getTime()
				: b.date.getTime() - a.date.getTime(),
		),
	);

	function saveData() {
		prefs.set({
			psa: {
				psa: show.psa,
				psadt: show.psadt,
				psavel: show.psavel,
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
	//$effect(() => updateTooltip());
</script>

<div class="grid h-[calc(100%-112px)] gap-2 print:grid-cols-[1fr_auto]">
	<div class="mx-auto w-full flex flex-col gap-4 p-4">
		<div class="no-print flex items-center gap-5">
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
				bind:this={tooltip}
				>{show.years} Year{show.years !== 1 ? "s" : ""}</span>
		</div>
		<Psa {psas} {points} {show} {keys} />
	</div>
	<div class="flex mx-14 flex-col">
		<div class="flex items-center gap-2 text-lg font-bold pb-1">
			<span class="underline">PSA HISTORY </span>
			<button
				class="arrow no-print hover:text-primary-500"
				class:ascending={show.sort}
				onclick={() => (show.sort = !show.sort)}>↓</button>
		</div>
		{#each displayDataText as display, i (display)}
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
					<span class=""
						>---&gt; {display.test}
						{display.comment !== "N/A" ? `(${display.value})` : ""}</span>
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
</style>

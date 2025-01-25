<script lang="ts">
	import { clipboard } from "@skeletonlabs/skeleton";
	import { copyclipboard } from "$lib/svgs";

	type Props = {
		psa?: number;
	};

	let { psa = 0 }: Props = $props();
	let l = $state(0);
	let w = $state(0);
	let h = $state(0);
	let volume = $state(0);
	let measuredby = $state("CT");
	let measureunits = $state("cm");
	let volumetype = $state("Modified Bullet");
	let ellipsoidVolume;
	let modBulletVolume;

	function calculateVolume() {
		if (!l || !w || !h) return;
		const box = l * w * h;
		ellipsoidVolume = Number((box * 0.52).toFixed(0));
		modBulletVolume = Number((box * 0.66).toFixed(0));
		if (ellipsoidVolume >= 30) volumetype = "Modified Bullet";
		else if (modBulletVolume < 30) volumetype = "Ellipsoid";
		volume = volumetype === "Bullet" ? modBulletVolume : ellipsoidVolume;
	}

	let psad = $derived.by(() => {
		if (!psa || !volume) return 0;
		return (psa / volume).toFixed(2);
	});

	function selectAll(e: FocusEvent) {
		(e.currentTarget as HTMLInputElement).select();
	}
</script>

<div>
	<h1 class="text-3xl text-center pb-6">Prostate Volume Calculator</h1>
	<div class="grid grid-cols-[350px_405px] gap-4 p-4">
		<div class="">
			<h2 class="flex pb-2">
				Prostate Measurements: <span class="flex items-center"
					><label class="pl-5"
						><input
							class="radio mr-2"
							type="radio"
							value="cm"
							bind:group={measureunits} />cm</label>
					<label class="pl-5"
						><input
							class="radio mr-2"
							type="radio"
							value="mm"
							bind:group={measureunits} />mm</label>
				</span>
			</h2>
			<div class="grid grid-cols-[80px_70px_1fr] items-center gap-x-3 gap-y-2">
				<label class="grid justify-end" for="width">Width:</label><input
					id="width"
					type="text"
					class="input p-1 justify-center text-center"
					bind:value={w}
					onchange={calculateVolume}
					onfocus={selectAll} />
				{measureunits}
				<label class="grid justify-end" for="height">Height:</label><input
					id="height"
					type="number"
					class="input p-1 text-center"
					bind:value={h}
					onchange={calculateVolume}
					onfocus={selectAll} />
				{measureunits}
				<label class="grid justify-end" for="length">Length:</label><input
					id="length"
					type="number"
					class="input p-1 text-center"
					bind:value={l}
					onchange={calculateVolume}
					onfocus={selectAll} />
				{measureunits}
				<span class="grid justify-end">PSA:</span><input
					type="number"
					class="input p-1 text-center"
					bind:value={psa} />
				ng/ml
			</div>
		</div>
		<div>
			<div class="grid grid-cols-[150px_1fr]">
				<div>
					<h2 class="pb-2">Measured By:</h2>
					<label class="pl-5"
						><input
							class="radio mr-2"
							type="radio"
							value="CT"
							bind:group={measuredby} />by CT</label>
					<label class="pl-5"
						><input
							class="radio mr-2"
							type="radio"
							value="US"
							bind:group={measuredby} />by US</label>
				</div>
				<div>
					<h2 class="pb-2">Formula:</h2>
					<span>
						<label class="pl-5"
							><input
								class="radio mr-2"
								type="radio"
								value="Modified Bullet"
								bind:group={volumetype} />Modified Bullet
							<div class="text-xs pl-7 italic">
								more accurate for larger prostates
							</div>
						</label>
					</span>
					<label class="pl-5"
						><input
							class="radio mr-2"
							type="radio"
							value="Ellipsoid"
							bind:group={volumetype} />Ellipsoid
						<div class="text-xs pl-7 italic">
							more accurate for smaller prostates
						</div>
					</label>
				</div>
			</div>
			<div class="grid grid-cols-[150px_1fr] items-center gap-x-2 pt-4">
				<h2 class="grid justify-end">Prostate Volume:</h2>
				<span>
					<input
						type="number"
						class="input p-1 w-20 text-center"
						bind:value={volume}
						onfocus={selectAll} />
					ccs³
					{#if volume}
						<button
							type="button"
							class="button btn copy p-1 fill-white hover:fill-secondary-500"
							disabled={!volume}
							title="Copy Prostate Volume to Clipboard"
							onfocus={selectAll}
							use:clipboard={`${measuredby} Calculated Prostate Volume (${volumetype} Formula): ${volume}ccs. `}>
							{@html copyclipboard}</button
						>{/if}</span>
				<h2 class="grid justify-end">PSA Density:</h2>
				{#if psa && volume}
					<div>
						{psad} cc³/ng/cc (normal &lt0.14)
						<button
							class="button btn copy p-1 fill-white hover:fill-secondary-500"
							type="button"
							disabled={!psad}
							title="Copy PSA Density to Clipboard"
							use:clipboard={`Prostate PSA Density: ${psad}ng/cc/cc³ (normal <0.14). `}>
							{@html copyclipboard}</button>
					</div>
				{:else}
					<div class="text-xs italic">
						Missing{!psa ? " PSA" : ""}{!psa && !volume ? " and " : ""}{!volume
							? " Volume"
							: ""}
					</div>
				{/if}
			</div>
			{#if psa && volume}
				<button
					class="button btn copy p-1 fill-white hover:fill-secondary-500"
					type="button"
					disabled={!psad || !volume}
					title="Copy Prostate Volume and PSA Density to Clipboard"
					use:clipboard={`${measuredby} Calculated Prostate Volume (${volumetype} Formula): ${volume}ccs, Prostate PSA Density: ${psad}ng/cc/cc³ (normal <0.14). `}>
					{@html copyclipboard}</button>
			{/if}
		</div>
	</div>
</div>

<style>
	input[type="number"]::-webkit-inner-spin-button,
	input[type="number"]::-webkit-outer-spin-button {
		-webkit-appearance: none;
		-moz-appearance: textfield;
		margin: 0;
		appearance: none;
	}
</style>

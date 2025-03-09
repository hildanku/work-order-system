<script lang="ts">
    import { fade, slide } from "svelte/transition";
    import { Card, CardContent } from "$lib/components/ui/card";
    import { Button } from "$lib/components/ui/button";
    import type { ComponentType } from "svelte";
    import TimelineItem from "$project/components/timeline/timeline-item.svelte";

    // Timeline item type
    type TimelineItemType = {
        id: string;
        title: string;
        description: string;
        date: string;
        icon?: ComponentType;
        link?: string;
    };

    // Props type
    type Props = {
        items: TimelineItemType[];
    };

    // Initialize props with $props() rune
    let { items }: Props = $props();
</script>

<div transition:fade class="relative my-8">
    <!-- Timeline line -->
    <div class="absolute inset-0 flex justify-center">
        <div class="h-full w-0.5 bg-border"></div>
    </div>

    <!-- Timeline items -->
    <div class="relative space-y-8">
        {#each items as item}
            <div transition:slide>
                <TimelineItem {item} />
            </div>
        {/each}
    </div>
</div>

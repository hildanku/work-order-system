<script lang="ts">
import Timeline from "$project/components/timeline/timeline.svelte";
import { Button } from "$lib/components/ui/button";
import { Settings2Icon, RefreshCwIcon } from "lucide-svelte";

// Timeline items type
type TimelineItem = {
    id: string;
    title: string;
    description: string;
    date: string;
    icon?: typeof Settings2Icon;
    link?: string;
};

// Timeline items data
const timelineItems: TimelineItem[] = $state([
    {
        id: "1",
        title: "Application submitted",
        description: "Your application has been submitted successfully",
        date: "2021-01-01",
        icon: Settings2Icon,
    },
    {
        id: "2",
        title: "Under review",
        description: "Our team is reviewing your application",
        date: "2021-01-02",
        icon: RefreshCwIcon,
        link: "#",
    },
]);
</script>

<main class="container mx-auto p-4">
<Timeline items={timelineItems} />
</main>
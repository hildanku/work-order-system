<div class="flex items-center">
    <!-- Timeline dot -->
    <div class="relative flex h-16 w-16 items-center justify-center">
        <div class="absolute h-4 w-4 rounded-full bg-primary"></div>
        {#if item.icon}
            <div class="absolute -inset-2 flex items-center justify-center rounded-full bg-muted p-2">
                <svelte:component this={item.icon} class="h-6 w-6" />
            </div>
        {/if}
    </div>

    <!-- Timeline content -->
    <Card class="flex-1">
        <CardHeader>
            <div class="flex items-center justify-between">
                <CardTitle>{item.title}</CardTitle>
                <CardDescription>{item.date}</CardDescription>
            </div>
        </CardHeader>
        <CardContent>
            <p class="text-sm text-muted-foreground">{item.description}</p>
            {#if item.link}
                <Button variant="link" class="mt-2 px-0" href={item.link}>Learn more</Button>
            {/if}
        </CardContent>
    </Card>
</div>
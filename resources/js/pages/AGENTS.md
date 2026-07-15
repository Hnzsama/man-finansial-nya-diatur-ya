# Page Component Rules (`resources/js/pages/`)

These rules MUST be followed for every page component in this directory. Failure causes bugs like double sidebars, inconsistent UI, and broken layouts.

## 1. LAYOUT PATTERN — Critical Rule

**NEVER wrap page content with `<AppLayout>` directly inside the JSX `return()` statement.**

Always use the `.layout` static property pattern at the **bottom** of the file:

```tsx
// CORRECT
export default function MyPage({ ... }: PageProps) {
    return (
        <>
            <Head title="My Page" />
            <div className="flex flex-1 flex-col">
                {/* page content */}
            </div>
        </>
    );
}

MyPage.layout = (page: React.ReactNode) => (
    <AppLayout breadcrumbs={breadcrumbs}>{page}</AppLayout>
);
```

```tsx
// WRONG — causes double sidebar!
export default function MyPage() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="My Page" />
        </AppLayout>
    );
}
```

Reference: `Categories/Index.tsx`, `Wallets/Index.tsx`.

---

## 2. PAGE CONTENT WRAPPER

Every page's return root must use this exact structure:

```tsx
<>
    <Head title="Page Title" />
    <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6 px-4 lg:px-6">
                {/* page content */}
            </div>
        </div>
    </div>
</>
```

---

## 3. PAGE HEADER

```tsx
<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
    <div className="space-y-1">
        <h2 className="text-xl font-semibold">Page Title</h2>
        <p className="text-sm text-muted-foreground">Description.</p>
    </div>
    <Button onClick={...} className="w-full sm:w-auto">
        <IconPlus className="mr-2 h-4 w-4" /> Primary Action
    </Button>
</div>
```

Do NOT use `<h1 className="text-3xl font-bold">`. Use `<h2 className="text-xl font-semibold">`.

---

## 4. SUMMARY CARDS

Use this exact pattern — NOT plain `text-2xl font-bold` in CardContent:

```tsx
<div className="grid grid-cols-1 gap-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card *:data-[slot=card]:shadow-xs @xl/main:grid-cols-2 @5xl/main:grid-cols-3 dark:*:data-[slot=card]:bg-card">
    <Card className="@container/card">
        <CardHeader>
            <CardDescription>Label</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">Value</CardTitle>
            <CardAction><Badge variant="outline"><SomeIcon className="h-4 w-4" /></Badge></CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
            <div className="line-clamp-1 flex gap-2 font-medium">Label <SomeIcon className="size-4" /></div>
            <div className="text-muted-foreground">Supporting text</div>
        </CardFooter>
    </Card>
</div>
```

---

## 5. SHARED TYPES

Import from `@/types`, never redefine local interfaces for shared models:

```tsx
import type { Wallet, Category, Transaction, Budget } from '@/types';
```

---

## 6. COMPONENT DECOMPOSITION

Split complex pages into `components/` subdirectory:

```
MyModule/
├── Index.tsx            ← state + composition only
└── components/
    ├── summary-cards.tsx
    ├── filter-bar.tsx
    ├── columns.tsx
    ├── data-table.tsx
    └── my-module-sheet.tsx
```

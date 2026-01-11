export default function DesignSystemPage() {
    return (
        <div className="min-h-screen bg-primary text-text-primary p-8 space-y-12">
            <section>
                <h1 className="text-2xl font-bold mb-4">Design System Showcase</h1>
                <p className="text-text-secondary">
                    Verifying fonts, colors, and primitives.
                </p>
            </section>

            <section className="space-y-4">
                <h2 className="text-xl font-semibold border-b border-white/10 pb-2">
                    Typography
                </h2>
                <div className="space-y-2">
                    <p className="text-4xl">text-4xl: Hero PnL (Inter)</p>
                    <p className="text-2xl">text-2xl: Page Headers</p>
                    <p className="text-xl">text-xl: Section Headers</p>
                    <p className="text-lg">text-lg: Emphasis</p>
                    <p className="text-base">text-base: Body, Chat</p>
                    <p className="text-sm">text-sm: Labels</p>
                    <p className="text-xs">text-xs: Meta, Timestamps</p>
                </div>
                <div className="mt-4">
                    <p className="font-mono text-4xl text-pnl-green">+ $1,204.50</p>
                    <p className="font-mono text-4xl text-pnl-red">- $420.69</p>
                    <p className="font-mono text-base text-text-secondary">
                        JetBrains Mono for numbers
                    </p>
                </div>
            </section>

            <section className="space-y-4">
                <h2 className="text-xl font-semibold border-b border-white/10 pb-2">
                    Colors
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-4 rounded-xl bg-primary border border-white/10">
                        bg-primary
                    </div>
                    <div className="p-4 rounded-xl bg-surface border border-white/10">
                        bg-surface
                    </div>
                    <div className="p-4 rounded-xl bg-elevated border border-white/10">
                        bg-elevated
                    </div>
                    <div className="p-4 rounded-xl bg-accent text-white">bg-accent</div>
                    <div className="p-4 rounded-xl bg-pnl-green text-black">
                        bg-pnl-green
                    </div>
                    <div className="p-4 rounded-xl bg-pnl-red text-white">bg-pnl-red</div>
                </div>
            </section>

            <section className="space-y-4">
                <h2 className="text-xl font-semibold border-b border-white/10 pb-2">
                    UI Primitives
                </h2>
                <div className="flex gap-4 items-center">
                    <button className="h-10 px-6 rounded-xl bg-white text-primary font-medium hover:scale-[1.02] active:scale-100 transition-all">
                        Primary Button
                    </button>
                    <button className="h-10 px-6 rounded-xl bg-surface border border-white/10 text-text-primary hover:bg-elevated transition-colors">
                        Ghost Button
                    </button>
                    <div className="h-10 px-4 rounded-full bg-pnl-green/10 text-pnl-green flex items-center justify-center font-mono text-sm">
                        +12.5%
                    </div>
                </div>
            </section>
        </div>
    );
}

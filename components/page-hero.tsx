interface PageHeroProps {
  title: string
  subtitle?: string
  children: React.ReactNode
  stats?: Array<{
    value: React.ReactNode
    label: string
  }>
}

export default function PageHero({ title, subtitle, children, stats }: PageHeroProps) {
  return (
    <div className="relative -mt-[120px] mb-8">
      <div className="absolute inset-0 bg-gradient-to-b from-zinc-900/50 to-background" />
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-20" 
        style={{ backgroundImage: 'url(/bg_castle.jpeg?height=400&width=1920)' }}
      />
      <div className="relative pt-[160px] pb-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-8">
            <h1 className="text-4xl font-bold mb-4">{title}</h1>
            {subtitle && (
              <p className="text-lg text-zinc-400">{subtitle}</p>
            )}
          </div>

          <div className="max-w-2xl mx-auto">
            {children}
          </div>

          {stats && (
            <div className="flex justify-center gap-12 mt-8">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-2xl font-bold text-[#00E6B4]">{stat.value}</div>
                  <div className="text-sm text-zinc-400">{stat.label}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}


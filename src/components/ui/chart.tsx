import * as React from "react"
import { cn } from "@/lib/utils"

export type ChartConfig = {
  [k in string]: {
    label?: React.ReactNode
    icon?: React.ComponentType
    color?: string
  }
}

type ChartContextProps = {
  config: ChartConfig
}

const ChartContext = React.createContext<ChartContextProps | null>(null)

function useChart() {
  const context = React.useContext(ChartContext)
  if (!context) {
    throw new Error("useChart must be used within a <ChartContainer />")
  }
  return context
}

const ChartContainer = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & {
    config?: ChartConfig
    children: React.ReactNode
  }
>(({ id, className, children, config = {}, ...props }, ref) => {
  return (
    <ChartContext.Provider value={{ config }}>
      <div
        ref={ref}
        className={cn("w-full h-full", className)}
        {...props}
      >
        {children}
      </div>
    </ChartContext.Provider>
  )
})
ChartContainer.displayName = "Chart"

const ChartTooltip = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>
}

const ChartTooltipContent = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>
}

const ChartLegend = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>
}

const ChartLegendContent = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>
}

export {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
}

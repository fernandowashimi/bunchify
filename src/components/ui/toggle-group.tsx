"use client"

import * as React from "react"
import { Toggle as TogglePrimitive } from "@base-ui/react/toggle"
import { ToggleGroup as ToggleGroupPrimitive } from "@base-ui/react/toggle-group"
import { type VariantProps } from "class-variance-authority"
import { cn } from "cn"

import { segmentIndicatorItemClass, toggleVariants } from "@/components/ui/toggle"

const ToggleGroupContext = React.createContext<
  VariantProps<typeof toggleVariants> & {
    spacing?: number
    orientation?: "horizontal" | "vertical"
  }
>({
  size: "default",
  variant: "default",
  spacing: 2,
  orientation: "horizontal",
})

function segmentClip(index: number, count: number) {
  const span = `(100% - 2 * var(--segment-pad) - ${count - 1} * var(--segment-gap)) / ${count}`
  const left = `calc(var(--segment-pad) + ${index} * ((${span}) + var(--segment-gap)))`
  const right = `calc(var(--segment-pad) + ${count - 1 - index} * ((${span}) + var(--segment-gap)))`
  return `inset(var(--segment-pad) ${right} var(--segment-pad) ${left} round var(--segment-radius))`
}

function duplicateContent(children: React.ReactNode) {
  return React.Children.map(children, (child, index) =>
    React.isValidElement(child) ? React.cloneElement(child, { key: index }) : child
  )
}

function SegmentIndicator({
  count,
  index,
  entries,
}: {
  count: number
  index: number
  entries: React.ReactElement<{ value?: string; children?: React.ReactNode }>[]
}) {
  const previous = React.useRef<number | null>(null)
  const slide = previous.current !== null && index >= 0
  const shown = index >= 0 ? index : (previous.current ?? 0)

  React.useEffect(() => {
    previous.current = index >= 0 ? index : null
  }, [index])

  if (count < 2) return null

  return (
    <div
      aria-hidden
      inert
      data-segment-indicator=""
      className={cn(
        "pointer-events-none absolute inset-0 z-1 flex items-center gap-[--spacing(var(--gap))] bg-muted p-1 text-foreground",
        index < 0 ? "opacity-0" : "opacity-100",
        slide
          ? "transition-[clip-path,opacity] duration-[250ms] ease-[var(--ease-in-out)]"
          : "transition-opacity duration-200 ease-[var(--ease-out)]",
        "motion-reduce:transition-none"
      )}
      style={{ clipPath: segmentClip(shown, count) }}
    >
      {entries.map((entry) => (
        <span key={entry.props.value} className={segmentIndicatorItemClass}>
          {duplicateContent(entry.props.children)}
        </span>
      ))}
    </div>
  )
}

function ToggleGroup({
  className,
  variant,
  size,
  spacing = 2,
  orientation = "horizontal",
  children,
  value,
  ...props
}: ToggleGroupPrimitive.Props &
  VariantProps<typeof toggleVariants> & {
    spacing?: number
    orientation?: "horizontal" | "vertical"
  }) {
  const entries = React.Children.toArray(children).filter(
    (child): child is React.ReactElement<{ value?: string; children?: React.ReactNode }> =>
      React.isValidElement(child)
  )
  const selected = Array.isArray(value) ? value[0] : undefined
  const selectedIndex =
    selected == null ? -1 : entries.findIndex((entry) => entry.props.value === selected)
  const segment = variant === "segment" && orientation === "horizontal"

  return (
    <ToggleGroupPrimitive
      data-slot="toggle-group"
      data-variant={variant}
      data-size={size}
      data-spacing={spacing}
      data-orientation={orientation}
      style={
        {
          "--gap": spacing,
          ...(segment
            ? {
                "--segment-pad": "0.25rem",
                "--segment-gap": `calc(0.25rem * ${spacing})`,
                "--segment-radius": "calc(var(--radius) - var(--segment-pad))",
              }
            : null),
        } as React.CSSProperties
      }
      className={cn(
        "group/toggle-group flex w-fit flex-row items-center gap-[--spacing(var(--gap))] rounded-lg data-[size=sm]:rounded-[min(var(--radius-md),10px)] data-vertical:flex-col data-vertical:items-stretch data-[variant=segment]:relative data-[variant=segment]:w-full data-[variant=segment]:border data-[variant=segment]:border-border data-[variant=segment]:bg-card data-[variant=segment]:p-1",
        className
      )}
      value={value}
      {...props}
    >
      <ToggleGroupContext.Provider
        value={{ variant, size, spacing, orientation }}
      >
        {children}
        {segment ? (
          <SegmentIndicator count={entries.length} index={selectedIndex} entries={entries} />
        ) : null}
      </ToggleGroupContext.Provider>
    </ToggleGroupPrimitive>
  )
}

function ToggleGroupItem({
  className,
  children,
  variant = "default",
  size = "default",
  ...props
}: TogglePrimitive.Props & VariantProps<typeof toggleVariants>) {
  const context = React.useContext(ToggleGroupContext)

  return (
    <TogglePrimitive
      data-slot="toggle-group-item"
      data-variant={context.variant || variant}
      data-size={context.size || size}
      data-spacing={context.spacing}
      className={cn(
        "shrink-0 group-data-[spacing=0]/toggle-group:rounded-none group-data-[spacing=0]/toggle-group:px-2 focus:z-10 focus-visible:z-10 group-data-[spacing=0]/toggle-group:has-data-[icon=inline-end]:pr-1.5 group-data-[spacing=0]/toggle-group:has-data-[icon=inline-start]:pl-1.5 group-data-horizontal/toggle-group:data-[spacing=0]:first:rounded-l-lg group-data-vertical/toggle-group:data-[spacing=0]:first:rounded-t-lg group-data-horizontal/toggle-group:data-[spacing=0]:last:rounded-r-lg group-data-vertical/toggle-group:data-[spacing=0]:last:rounded-b-lg group-data-horizontal/toggle-group:data-[spacing=0]:data-[variant=outline]:border-l-0 group-data-vertical/toggle-group:data-[spacing=0]:data-[variant=outline]:border-t-0 group-data-horizontal/toggle-group:data-[spacing=0]:data-[variant=outline]:first:border-l group-data-vertical/toggle-group:data-[spacing=0]:data-[variant=outline]:first:border-t",
        toggleVariants({
          variant: context.variant || variant,
          size: context.size || size,
        }),
        className
      )}
      {...props}
    >
      {children}
    </TogglePrimitive>
  )
}

export { ToggleGroup, ToggleGroupItem }

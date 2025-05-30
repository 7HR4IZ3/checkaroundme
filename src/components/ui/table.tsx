"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

/**
 * Renders a responsive HTML table with predefined styling and an optional custom class name.
 *
 * The table is wrapped in a container that enables horizontal scrolling on overflow.
 *
 * @param className - Additional class names to apply to the table element.
 */
function Table({ className, ...props }: React.ComponentProps<"table">) {
  return (
    <div
      data-slot="table-container"
      className="relative w-full overflow-x-auto"
    >
      <table
        data-slot="table"
        className={cn("w-full caption-bottom text-sm", className)}
        {...props}
      />
    </div>
  )
}

/**
 * Renders a table header section with a bottom border applied to all child rows.
 *
 * Spreads additional props onto the underlying `<thead>` element and sets a `data-slot` attribute for slot identification.
 */
function TableHeader({ className, ...props }: React.ComponentProps<"thead">) {
  return (
    <thead
      data-slot="table-header"
      className={cn("[&_tr]:border-b", className)}
      {...props}
    />
  )
}

/**
 * Renders a styled `<tbody>` element for use within a table.
 *
 * Applies a class that removes the border from the last table row and includes any additional classes provided.
 */
function TableBody({ className, ...props }: React.ComponentProps<"tbody">) {
  return (
    <tbody
      data-slot="table-body"
      className={cn("[&_tr:last-child]:border-0", className)}
      {...props}
    />
  )
}

/**
 * Renders a styled table footer (`<tfoot>`) element with background color, top border, and font weight, removing the bottom border from the last row.
 *
 * @remark
 * Adds a `data-slot="table-footer"` attribute for slot identification.
 */
function TableFooter({ className, ...props }: React.ComponentProps<"tfoot">) {
  return (
    <tfoot
      data-slot="table-footer"
      className={cn(
        "bg-muted/50 border-t font-medium [&>tr]:last:border-b-0",
        className
      )}
      {...props}
    />
  )
}

/**
 * Renders a table row with styling for hover, selected state, and border.
 *
 * Combines custom and predefined classes for consistent appearance and interaction feedback.
 */
function TableRow({ className, ...props }: React.ComponentProps<"tr">) {
  return (
    <tr
      data-slot="table-row"
      className={cn(
        "hover:bg-muted/50 data-[state=selected]:bg-muted border-b transition-colors",
        className
      )}
      {...props}
    />
  )
}

/**
 * Renders a styled table header cell (`<th>`) with predefined classes and a `data-slot` attribute for identification.
 *
 * @param className - Additional class names to merge with the default styles.
 */
function TableHead({ className, ...props }: React.ComponentProps<"th">) {
  return (
    <th
      data-slot="table-head"
      className={cn(
        "text-foreground h-10 px-2 text-left align-middle font-medium whitespace-nowrap [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
        className
      )}
      {...props}
    />
  )
}

/**
 * Renders a styled table cell (`<td>`) element with optional custom classes and a slot identifier.
 *
 * @param className - Additional CSS classes to apply to the cell.
 */
function TableCell({ className, ...props }: React.ComponentProps<"td">) {
  return (
    <td
      data-slot="table-cell"
      className={cn(
        "p-2 align-middle whitespace-nowrap [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
        className
      )}
      {...props}
    />
  )
}

/**
 * Renders a styled table caption element with muted text and spacing.
 *
 * Adds a `data-slot="table-caption"` attribute for slot identification and merges custom classes with default styling.
 */
function TableCaption({
  className,
  ...props
}: React.ComponentProps<"caption">) {
  return (
    <caption
      data-slot="table-caption"
      className={cn("text-muted-foreground mt-4 text-sm", className)}
      {...props}
    />
  )
}

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
}

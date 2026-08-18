import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

export interface SearchableSelectProps {
  options: { label: string; value: string }[];
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  emptyText?: string;
  disabled?: boolean;
}

export function SearchableSelect({
  options,
  value,
  onValueChange,
  placeholder = "Select...",
  emptyText = "No results found.",
  disabled = false,
}: SearchableSelectProps) {
  const [open, setOpen] = React.useState(false)

  // Find the selected option's label to display in the trigger button.
  // Using find allows displaying the label if value is an ID, but here value is usually the name.
  const selectedLabel = options.find((opt) => opt.value === value)?.label || value || placeholder

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between font-normal"
          disabled={disabled}
        >
          <span className="truncate">{selectedLabel}</span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" style={{ minWidth: "var(--radix-popover-trigger-width)" }}>
        <Command>
          <CommandInput placeholder={placeholder} />
          <CommandList>
            <CommandEmpty>{emptyText}</CommandEmpty>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.label} // CommandItem uses value for filtering, often it's best to filter by label
                  onSelect={(currentValue) => {
                    // cmdk passes the lowercase textValue as currentValue, so we find the original option
                    const selected = options.find((opt) => opt.label.toLowerCase() === currentValue.toLowerCase())
                    if (selected) {
                      onValueChange(selected.value)
                    } else {
                      onValueChange(currentValue)
                    }
                    setOpen(false)
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4 shrink-0",
                      value === option.value ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {option.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

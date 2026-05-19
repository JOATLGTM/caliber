import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export type FAQItem = [question: string, answer: string];

interface FAQProps {
  items: FAQItem[];
  defaultOpen?: number;
}

export function FAQ({ items, defaultOpen = 0 }: FAQProps) {
  return (
    <Accordion
      type="single"
      collapsible
      defaultValue={`item-${defaultOpen}`}
      className="border-t border-border"
    >
      {items.map(([q, a], i) => (
        <AccordionItem key={i} value={`item-${i}`} className="border-b border-border">
          <AccordionTrigger className="py-4 text-left font-display text-[15px] font-semibold tracking-[-0.018em]">
            {q}
          </AccordionTrigger>
          <AccordionContent className="pb-4 text-[13.5px] leading-[1.65] text-text-muted">
            {a}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}

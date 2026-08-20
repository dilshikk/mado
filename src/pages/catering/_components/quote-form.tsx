import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Textarea } from "@/components/ui/textarea.tsx";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form.tsx";
import api from "@/lib/api.ts";
import { useLanguage } from "@/hooks/use-language.ts";
import { quoteFormText } from "@/lib/i18n/catering.ts";

type QuoteFormValues = {
  fullName: string;
  email: string;
  phone: string;
  eventType: string;
  eventDate: string;
  guestCount: string;
  budget?: string;
  message?: string;
};

export default function QuoteForm() {
  const [submitting, setSubmitting] = useState(false);
  const { lang } = useLanguage();
  const t = quoteFormText[lang];

  const quoteSchema = z.object({
    fullName: z.string().min(1, t.nameRequired),
    email: z.string().email(t.emailInvalid),
    phone: z.string().min(1, t.phoneRequired),
    eventType: z.string().min(1, t.eventTypeRequired),
    eventDate: z.string().min(1, t.eventDateRequired),
    guestCount: z.string().min(1, t.guestCountRequired),
    budget: z.string().optional(),
    message: z.string().optional(),
  });

  const form = useForm<QuoteFormValues>({
    resolver: zodResolver(quoteSchema),
    defaultValues: {
      fullName: "", email: "", phone: "",
      eventType: "", eventDate: "", guestCount: "",
      budget: "", message: "",
    },
  });

  const onSubmit = async (values: QuoteFormValues) => {
    try {
      setSubmitting(true);
      await api.createCateringRequest({
        name:        values.fullName,
        email:       values.email,
        phone:       values.phone,
        event_type:  values.eventType,
        event_date:  values.eventDate,
        guest_count: parseInt(values.guestCount, 10),
        budget:      values.budget || null,
        message:     values.message || null,
      });
      toast.success(t.successTitle, {
        description: t.successDesc(values.fullName),
      });
      form.reset();
    } catch {
      toast.error(t.errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="grid grid-cols-1 gap-4 sm:grid-cols-2"
      >
        <FormField
          control={form.control}
          name="fullName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t.fullName}</FormLabel>
              <FormControl>
                <Input placeholder={t.fullNamePlaceholder} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t.email}</FormLabel>
              <FormControl>
                <Input placeholder="example@gmail.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t.phone}</FormLabel>
              <FormControl>
                <Input placeholder={t.phonePlaceholder} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="eventType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t.eventType}</FormLabel>
              <FormControl>
                <Input placeholder={t.eventTypePlaceholder} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="eventDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t.eventDate}</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="guestCount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t.guestCount}</FormLabel>
              <FormControl>
                <Input placeholder={t.guestCountPlaceholder} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="budget"
          render={({ field }) => (
            <FormItem className="sm:col-span-2">
              <FormLabel>{t.budget}</FormLabel>
              <FormControl>
                <Input placeholder={t.budgetPlaceholder} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="message"
          render={({ field }) => (
            <FormItem className="sm:col-span-2">
              <FormLabel>{t.message}</FormLabel>
              <FormControl>
                <Textarea
                  rows={4}
                  placeholder={t.messagePlaceholder}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button
          type="submit"
          size="lg"
          disabled={submitting}
          className="cursor-pointer bg-accent text-accent-foreground hover:bg-accent/90 sm:col-span-2 disabled:opacity-70"
        >
          {submitting
            ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> {t.sendingBtn}</>
            : t.submitBtn}
        </Button>
      </form>
    </Form>
  );
}

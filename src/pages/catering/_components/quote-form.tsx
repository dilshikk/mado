import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
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

const quoteSchema = z.object({
  fullName: z.string().min(1, "Введите ваше имя"),
  email: z.string().email("Введите корректный email"),
  phone: z.string().min(1, "Введите номер телефона"),
  eventType: z.string().min(1, "Укажите тип мероприятия"),
  eventDate: z.string().min(1, "Укажите дату мероприятия"),
  guestCount: z.string().min(1, "Укажите количество гостей"),
  message: z.string().optional(),
});

type QuoteFormValues = z.infer<typeof quoteSchema>;

export default function QuoteForm() {
  const form = useForm<QuoteFormValues>({
    resolver: zodResolver(quoteSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      eventType: "",
      eventDate: "",
      guestCount: "",
      message: "",
    },
  });

  const onSubmit = (values: QuoteFormValues) => {
    toast.success("Заявка отправлена!", {
      description: `Спасибо, ${values.fullName}! Мы свяжемся с вами для обсуждения деталей мероприятия.`,
    });
    form.reset();
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
              <FormLabel>Полное имя</FormLabel>
              <FormControl>
                <Input placeholder="Иван Иванов" {...field} />
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
              <FormLabel>Email</FormLabel>
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
              <FormLabel>Номер телефона</FormLabel>
              <FormControl>
                <Input placeholder="+998 90 000 00 00" {...field} />
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
              <FormLabel>Тип мероприятия</FormLabel>
              <FormControl>
                <Input placeholder="Свадьба, юбилей, корпоратив..." {...field} />
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
              <FormLabel>Дата мероприятия</FormLabel>
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
              <FormLabel>Количество гостей</FormLabel>
              <FormControl>
                <Input placeholder="Например, 50" {...field} />
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
              <FormLabel>Сообщение</FormLabel>
              <FormControl>
                <Textarea
                  rows={4}
                  placeholder="Расскажите подробнее о вашем мероприятии..."
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
          className="cursor-pointer bg-accent text-accent-foreground hover:bg-accent/90 sm:col-span-2"
        >
          Запросить предложение
        </Button>
      </form>
    </Form>
  );
}

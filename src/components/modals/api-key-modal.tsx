// External Dependencies
import { Dispatch, SetStateAction } from 'react';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

// Relative Dependencies
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';

type Props = {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
};

const ApiKeyModal = ({ open, setOpen }: Props) => {
  const formSchema = z.object({
    openAI: z.string(),
    groq: z.string(),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    mode: 'onChange',
    resolver: zodResolver(formSchema),
    defaultValues: {
      openAI: '',
      groq: '',
    },
  });

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    if (!data.openAI || !data.groq) {
      toast.error('API Keys are required');
    } else {
      // TODO: Save API Keys
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="w-1/2 sm:w-3/5">
        <DialogHeader>
          <DialogTitle className="mb-2">API Keys</DialogTitle>
          <DialogDescription>Set Your API Keys</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col space-y-8"
          >
            <FormField
              control={form.control}
              name="openAI"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center sm:gap-4 lg:gap-0">
                  <FormLabel className="w-1/5">OpenAI</FormLabel>
                  <FormControl className="w-full">
                    <Input placeholder="OpenAI" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="groq"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center sm:gap-2 lg:gap-0">
                  <FormLabel className="w-1/5">Groq</FormLabel>
                  <FormControl className="w-full">
                    <Input placeholder="Groq" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="ml-auto">
              Submit
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default ApiKeyModal;

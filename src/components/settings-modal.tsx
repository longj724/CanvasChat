// External Dependencies
import { useState } from 'react';
import { Settings } from 'lucide-react';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

// Relative Dependencies
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { Textarea } from '@/components/ui/textarea';

type Props = {};

const SettingsModal = (props: Props) => {
  const [open, setOpen] = useState(false);

  const formSchema = z.object({
    name: z.string(),
    programmingLanguages: z.string(),
    packages: z.string(),
    context: z.string(),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    mode: 'onChange',
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      programmingLanguages: '',
      packages: '',
      context: '',
    },
  });

  const openSettingsModal = () => {
    console.log('clicked');
  };

  return (
    <div
      className="absolute right-[12px] top-[130px] hover:cursor-pointer z-50"
      onClick={openSettingsModal}
    >
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button size={'icon'}>
            <Settings />
          </Button>
        </DialogTrigger>
        <DialogContent className="w-1/2 sm:w-3/5">
          <DialogHeader>
            <DialogTitle className="mb-2">Global Settings Modal</DialogTitle>
            <DialogDescription>Test Description</DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form
              // onSubmit={form.handleSubmit(onSubmit)}
              className="flex flex-col space-y-8"
            >
              <FormField
                // control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center sm:gap-4 lg:gap-0">
                    <FormLabel className="w-1/5">Name</FormLabel>
                    <FormControl className="w-full">
                      <Input placeholder="Name" {...field} />
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
    </div>
  );
};

export default SettingsModal;

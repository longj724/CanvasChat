// External Dependencies
import { CirclePlus } from 'lucide-react';
import { useState } from 'react';
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
import { useCreateSpace } from '@/hooks/use-create-space';

const CreateSpaceModal = () => {
  const [open, setOpen] = useState(false);
  const mutation = useCreateSpace();

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    if (!data.name) {
      toast.error('Name is required');
    } else {
      mutation.mutate(
        {
          name: data.name,
        },
        {
          onSuccess: ({ data }) => {
            // TODO: revalidate get spaces query
            setOpen(false);
            form.reset();
          },
        }
      );
    }
  };

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

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <CirclePlus
          className="h-6 w-6"
          onClick={() => setOpen((prev) => !prev)}
        />
      </DialogTrigger>
      <DialogContent className="w-1/2 sm:w-3/5">
        <DialogHeader>
          <DialogTitle className="mb-2">Create Space</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col space-y-8"
          >
            <FormField
              control={form.control}
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
              Create
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateSpaceModal;

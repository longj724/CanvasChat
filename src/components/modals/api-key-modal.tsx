// External Dependencies
import { Dispatch, SetStateAction, useEffect } from 'react';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { LoaderCircle } from 'lucide-react';

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
import { PasswordInput } from '@/components/ui/password-input';
import { useGetApiKeys } from '@/hooks/use-get-api-keys';
import { useUpdateApiKeys } from '@/hooks/use-update-api-keys';

type Props = {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
};

const ApiKeyModal = ({ open, setOpen }: Props) => {
  const { data } = useGetApiKeys();
  const { updateApiKeysMutation, isLoading } = useUpdateApiKeys();
  const queryClient = useQueryClient();

  const formSchema = z.object({
    anthropic: z.string(),
    groq: z.string(),
    // ollamaUrl: z.string(),
    openAI: z.string(),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    mode: 'onChange',
    resolver: zodResolver(formSchema),
    defaultValues: {
      anthropic: '',
      groq: '',
      // ollamaUrl: '',
      openAI: '',
    },
  });

  const { reset } = form;

  useEffect(() => {
    if (data) {
      reset({
        anthropic: data.apiKeys?.anthropic || '',
        groq: data.apiKeys?.groq || '',
        // ollamaUrl: data.apiKeys?.ollamaUrl || '',
        openAI: data.apiKeys?.openAI || '',
      });
    }
  }, [data, reset]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    updateApiKeysMutation.mutate(
      {
        anthropicKey:
          values.anthropic ||
          ((data?.apiKeys.anthropic as string) ? '' : undefined),
        groqKey:
          values.groq || ((data?.apiKeys.groq as string) ? '' : undefined),
        // ollamaUrl:
        //   values.ollamaUrl ||
        //   ((data?.apiKeys.ollamaUrl as string) ? '' : undefined),
        openAIKey:
          values.openAI || ((data?.apiKeys.openAI as string) ? '' : undefined),
      },
      {
        onSuccess: () => {
          setOpen(false);
          queryClient.invalidateQueries({ queryKey: ['api-keys'] });
          toast.success('API Keys updated');
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="w-1/2 sm:w-3/5">
        <DialogHeader>
          <DialogTitle className="mb-2">API Keys</DialogTitle>
          <DialogDescription>Set your API keys</DialogDescription>
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
                    <PasswordInput placeholder="OpenAI" {...field} />
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
                    <PasswordInput placeholder="Groq" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="anthropic"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center sm:gap-2 lg:gap-0">
                  <FormLabel className="w-1/5">Anthropic</FormLabel>
                  <FormControl className="w-full">
                    <PasswordInput placeholder="Anthropic" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* <FormField
              control={form.control}
              name="ollamaUrl"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-center sm:gap-2 lg:gap-0">
                  <FormLabel className="w-1/5">Ollama Url</FormLabel>
                  <FormControl className="w-full mt-0">
                    <Input placeholder="Ollama URL" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            /> */}

            <Button type="submit" className="ml-auto">
              Submit
              {isLoading && (
                <LoaderCircle className="animate-spin text-muted-foreground ml-2" />
              )}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default ApiKeyModal;

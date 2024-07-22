import Link from 'next/link';

export default function TestSidebar() {
  return (
    <div className="flex h-full flex-col border-r bg-background">
      <div className="flex h-14 items-center border-b px-4">
        <h3 className="text-lg font-semibold">Files</h3>
      </div>
      <nav className="flex flex-col gap-2 p-4">
        <Link
          href="#"
          className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-muted hover:text-muted-foreground"
          prefetch={false}
        >
          <FolderIcon className="h-5 w-5" />
          <span>Documents</span>
        </Link>
        <Link
          href="#"
          className="flex items-center gap-3 rounded-md bg-muted px-3 py-2 text-sm font-medium text-primary transition-colors hover:bg-muted hover:text-muted-foreground"
          prefetch={false}
        >
          <FolderIcon className="h-5 w-5" />
          <span>Images</span>
        </Link>
        <Link
          href="#"
          className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-muted hover:text-muted-foreground"
          prefetch={false}
        >
          <FolderIcon className="h-5 w-5" />
          <span>Videos</span>
        </Link>
        <Link
          href="#"
          className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-muted hover:text-muted-foreground"
          prefetch={false}
        >
          <FolderIcon className="h-5 w-5" />
          <span>Music</span>
        </Link>
        <Link
          href="#"
          className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-muted hover:text-muted-foreground"
          prefetch={false}
        >
          <FolderIcon className="h-5 w-5" />
          <span>Downloads</span>
        </Link>
      </nav>
    </div>
  );
}

function FolderIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z" />
    </svg>
  );
}

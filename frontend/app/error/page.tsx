export default function ErrorPage({ error }: { error: Error & { digest?: string } }) {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Something went wrong!</h1>
        <p className="text-muted-foreground mb-4">{error.message}</p>
        <a href="/" className="text-primary hover:underline">
          Go back home
        </a>
      </div>
    </div>
  );
}
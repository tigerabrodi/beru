import ReactMarkdown from 'react-markdown'

type StoryContentProps = {
  content: string
}

export function StoryContent({ content }: StoryContentProps) {
  return (
    <div className="min-h-[200px] w-full">
      <div className="prose prose-sm md:prose-base lg:prose-lg dark:prose-invert [&>p]:mb-6">
        <ReactMarkdown>{content}</ReactMarkdown>
      </div>
    </div>
  )
}

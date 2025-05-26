import { InfiniteImageGrid } from "@/components/InfiniteImageGrid";

export default function ImageFeed() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4">Community Gallery</h1>
        <p className="text-muted-foreground">Discover amazing AI-generated artwork from our community</p>
      </div>
      
      <InfiniteImageGrid 
        initialLimit={20}
        onImageClick={(image) => {
          console.log("Image clicked:", image);
        }}
      />
    </div>
  );
}
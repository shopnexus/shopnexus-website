"use client";

import { useRef, useState } from "react";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "../../components/ui/Avatar";
import Button from "../../components/ui/Button";
import { ArrowRight, Play } from "lucide-react";

export default function About() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [showPlayButton, setShowPlayButton] = useState(true);

  const handlePlay = () => {
    const video = videoRef.current;
    if (video) {
      video.play().catch((err) => console.error("Play failed:", err));
      setShowPlayButton(false);
    }
  };

  return (
    <div className="flex flex-row items-start w-full ">
      <section className="w-full md:py-24 bg-gray-50">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center space-y-8 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">
                Behind the Build
              </h2>
              <p className="mx-auto max-w-[600px] text-gray-500 md:text-xl">
                Take a look at how we designed, developed, and brought our
                footwear vision to life online.
              </p>
            </div>

            <div className="w-full max-w-4xl mx-auto overflow-hidden rounded-lg shadow-xl">
              <div className="overflow-hidden w-full aspect-[16/9] relative">
                <video
                  ref={videoRef}
                  className="absolute top-0 left-0 w-full h-full object-cover scale-[1.78]"
                  poster="/poster.jpeg"
                  preload="metadata"
                  onEnded={() => setShowPlayButton(true)}
                  controls
                >
                  <source src="/onepice.mp4" type="video/mp4" />
                  Your browser does not support the video tag.
                </video>

                {showPlayButton && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Button
                      title="Play video"
                      variant="outline"
                      className="h-16 w-16 rounded-full bg-white/90 shadow-lg"
                      onClick={handlePlay}
                    >
                      <Play className="h-8 w-8" />
                      <span className="sr-only">Play video</span>
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="w-full md:py-24">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">
                Group 11
              </h2>
              <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl">
                We are Ms. Nguyen's students at the Academy of Posts and
                Telecommunications Technology. Our goal is to create a product
                that can help people in their daily lives. We believe that
                technology should be accessible to everyone, and we are
                committed to making that happen.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mt-12">
            {teamMembers.map((member, index) => (
              <div key={index} className="flex flex-col items-center space-y-4">
                <div className="relative h-40 w-40 rounded-full overflow-hidden">
                  <Avatar className="h-40 w-40">
                    <AvatarImage src={member.image} alt={member.name} />
                    <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                </div>
                <div className="space-y-1 text-center">
                  <h3 className="text-xl font-bold">{member.name}</h3>
                  <p className="text-sm text-gray-500">{member.role}</p>
                </div>
                <p className="text-sm text-center text-gray-500">
                  {member.bio}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

// Team member data
const teamMembers = [
  {
    name: "Khoa",
    role: "CEO & Founder",
    bio: "With over 15 years of industry experience, Sarah leads our company vision and strategy.",
    image:
      "https://i.pinimg.com/736x/b2/b6/98/b2b6982c43fedd6d4e073566b9caa1c9.jpg",
  },
  {
    name: "Chien",
    role: "CTO",
    bio: "Michael brings technical expertise and innovation to our product development process.",
    image:
      "https://i.pinimg.com/736x/b2/b6/98/b2b6982c43fedd6d4e073566b9caa1c9.jpg",
  },
  {
    name: "Tri",
    role: "Sales Director",
    bio: "Jessica has a proven track record of building strong client relationships and driving growth.",
    image:
      "https://i.pinimg.com/736x/b2/b6/98/b2b6982c43fedd6d4e073566b9caa1c9.jpg",
  },
  {
    name: "Phong",
    role: "Customer Success Manager",
    bio: "David ensures our clients achieve their goals through our solutions and services.",
    image:
      "https://i.pinimg.com/736x/b2/b6/98/b2b6982c43fedd6d4e073566b9caa1c9.jpg",
  },
];

import React from 'react';
import { StoryHero } from './StoryHero';
import { StoryTimeline } from './StoryTimeline';
import { StoryValues } from './StoryValues';
import { StoryTeam } from './StoryTeam';

export function StoryPage() {
  return (
    <div className="pt-20">
      <StoryHero />
      <StoryValues />
      <StoryTimeline />
      <StoryTeam />
    </div>
  );
}
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState } from 'react';

interface QuickPrompt {
  name: string;
  prompt: string;
}

interface PromptCategory {
  category: string;
  prompts: QuickPrompt[];
}

const qwenQuickPrompts: PromptCategory[] = [
  {
    category: "Perspective",
    prompts: [
      { name: "Back View", prompt: "从背面视角" },
      { name: "Front View", prompt: "从正面视角" },
      { name: "Side View", prompt: "侧面视角" },
      { name: "Rotate Left 45°", prompt: "相机视角向左旋转45度" },
      { name: "Flip Scene", prompt: "把场景翻转过来" },
      { name: "Top-down View", prompt: "从上方视角" },
      { name: "Bird's Eye View", prompt: "Change the scene to a birds eye view" },
      { name: "Zoom Out", prompt: "缩小场景" },
    ],
  },
  {
    category: "Pose Control",
    prompts: [
        { name: "T-pose", prompt: "T字姿势" },
        { name: "A-pose", prompt: "A字姿势" },
        { name: "Standing Pose", prompt: "站立姿势" },
        { name: "Sitting Pose", prompt: "坐姿" },
        { name: "Squatting Pose", prompt: "蹲姿" },
        { name: "Kneeling Pose", prompt: "跪姿" },
        { name: "Running Pose", prompt: "跑步动作" },
        { name: "Jumping Pose", prompt: "跳跃动作" },
        { name: "Look at Camera", prompt: "看向相机" },
        { name: "Bend Forward", prompt: "向前弯曲" },
        { name: "Character A-Pose Sheet", prompt: "生成全身图像，从头到脚的正面视角。角色采用虚幻引擎A-Pose姿势：站立，双臂向下向外倾斜。纯色背景，光线充足，无道具，无其他人物。正面视角，纯色背景，专业中性摄影棚照明，高细节，柔和细腻的阴影，清晰的轮廓。照明和布置应确保全身解剖结构清晰可见，专门用于3D参考和重定向工作流程。纯色背景，无道具，无其他人物。一致的照明。参考图像风格——清晰的解剖学参考A-Pose。真实感细节，4K分辨率。" },
    ],
  },
  {
    category: "Style",
    prompts: [
        { name: "Pencil Sketch", prompt: "铅笔素描" },
        { name: "Manga Line Art", prompt: "线稿" },
        { name: "Oil Painting", prompt: "油画风格" },
        { name: "Watercolor", prompt: "水彩画风格" },
        { name: "Comic Book", prompt: "漫画风格" },
        { name: "Neon Effect", prompt: "霓虹效果" },
        { name: "Sepia Tone", prompt: "Change the scene to sepia tone" },
        { name: "B&W Style", prompt: "黑白风格" },
    ]
  },
  {
    category: "Lighting & Color",
    prompts: [
        { name: "Add Colors", prompt: "Add colours to the scene" },
        { name: "Brighter", prompt: "提高亮度" },
        { name: "Darker", prompt: "降低亮度" },
        { name: "Increase Contrast", prompt: "增加对比度" },
        { name: "Change to Day", prompt: "Change the scene to day" },
        { name: "Change to Night", prompt: "Change the scene to night" },
        { name: "Studio Light", prompt: "Studio lighting" },
        { name: "Change Weather to...", prompt: "Change the weather to " },
    ]
  },
  {
    category: "Object & Composition",
    prompts: [
        { name: "Remove Background", prompt: "移除背景" },
        { name: "Blur Background", prompt: "背景模糊" },
        { name: "Remove [Object]", prompt: "移除[对象]" },
        { name: "Add [Object]", prompt: "添加[具体对象]" },
        { name: "Change [Object] Color", prompt: "Change the [object] to [color]"},
        { name: "Make [Object] Bigger", prompt: "放大[对象]" },
        { name: "Make [Object] Smaller", prompt: "缩小[对象]" },
        { name: "Sharpen Image", prompt: "图像锐化" },
    ]
  },
];

export const geminiQuickPrompts: PromptCategory[] = [
  {
    category: "Style",
    prompts: [
        { name: "Pencil Sketch", prompt: "Convert the image to a detailed pencil sketch." },
        { name: "Oil Painting", prompt: "Transform the image into an oil painting with visible brush strokes." },
        { name: "Watercolor", prompt: "Give the image a soft, watercolor-painted look." },
        { name: "Comic Book", prompt: "Apply a comic book art style with bold lines and halftone dots." },
        { name: "Neon Glow", prompt: "Add a futuristic neon glow effect to the subject." },
        { name: "Sepia Tone", prompt: "Apply a classic sepia tone filter for a vintage look." },
        { name: "Black & White", prompt: "Convert the image to a high-contrast black and white photo." },
    ]
  },
  {
    category: "Pose Control",
    prompts: [
        { name: "T-pose", prompt: "Change the person's pose to a T-pose." },
        { name: "A-pose", prompt: "Change the person's pose to an A-pose." },
        { name: "Standing", prompt: "Make the person stand up straight." },
        { name: "Sitting", prompt: "Make the person sit down." },
        { name: "Running", prompt: "Change the pose to be a dynamic running motion." },
        { name: "Jumping", prompt: "Make the person appear as if they are jumping." },
        { name: "Look at Camera", prompt: "Make the person look directly at the camera." },
        { name: "Character A-Pose Sheet", prompt: "Change the character's pose to a standard Unreal Engine A-Pose (standing, with arms angled downward and outward). Make sure the character is seen full-body, from head to toe, in a clear front view. Replace the background with a neutral solid color. Apply professional, even studio lighting to clearly show the full body anatomy, creating a high-detail, photorealistic 3D reference image with soft shadows and a crisp silhouette." },
    ],
  },
  {
    category: "Lighting & Color",
    prompts: [
        { name: "Brighter", prompt: "Make the lighting in the image brighter and more vibrant." },
        { name: "Darker", prompt: "Make the lighting in the image darker and more moody." },
        { name: "Increase Contrast", prompt: "Increase the contrast between light and dark areas." },
        { name: "Golden Hour", prompt: "Change the lighting to a warm, golden hour glow." },
        { name: "Studio Lighting", prompt: "Apply professional studio lighting to the subject." },
        { name: "Change to Night", prompt: "Change the time of day in the image to night." },
    ]
  },
  {
    category: "Object & Composition",
    prompts: [
        { name: "Remove Background", prompt: "Completely remove the background, leaving only the main subject." },
        { name: "Blur Background", prompt: "Apply a strong blur to the background to create a depth-of-field effect." },
        { name: "Remove [Object]", prompt: "Remove the selected object from the image." },
        { name: "Add [Object]", prompt: "Add [a specific object] to the scene realistically." },
        { name: "Change Color of...", prompt: "Change the color of the selected object to [color]."},
        { name: "Make Bigger", prompt: "Make the selected object larger." },
        { name: "Make Smaller", prompt: "Make the selected object smaller." },
        { name: "Sharpen", prompt: "Slightly sharpen the details of the image." },
    ]
  },
];

interface QwenPromptGuideProps {
  selectedPrompts: string[];
  onPromptToggle: (prompt: string) => void;
}

export const QwenPromptGuide: React.FC<QwenPromptGuideProps> = ({ selectedPrompts, onPromptToggle }) => {
  const [activeCategory, setActiveCategory] = useState<string>(qwenQuickPrompts[0].category);

  const activePrompts = qwenQuickPrompts.find(c => c.category === activeCategory)?.prompts || [];

  return (
    <div className="w-full bg-gray-800/50 border border-gray-700 rounded-lg p-3 flex flex-col gap-3 animate-fade-in backdrop-blur-sm mb-4">
      <div className="flex items-center gap-2 overflow-x-auto pb-2 -mb-2" style={{ scrollbarWidth: 'thin' }}>
        {qwenQuickPrompts.map(({ category }) => (
          <button
            key={category}
            onClick={() => setActiveCategory(category)}
            className={`flex-shrink-0 font-semibold py-2 px-4 rounded-md transition-all duration-200 text-sm whitespace-nowrap ${
              activeCategory === category
              ? 'bg-white/10 text-white'
              : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            {category}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
        {activePrompts.map(({ name, prompt }) => {
          const isSelected = selectedPrompts.includes(prompt);
          return (
            <button
              key={name}
              onClick={() => onPromptToggle(prompt)}
              className={`text-center font-medium py-2 px-3 rounded-md transition-all duration-200 ease-in-out active:scale-95 text-xs h-full border ${
                isSelected
                  ? 'bg-blue-600 text-white border-blue-500 hover:bg-blue-500'
                  : 'bg-white/5 border-transparent text-gray-300 hover:bg-white/10 hover:border-white/10'
              }`}
              title={`Use prompt: "${prompt}"`}
            >
              {name}
            </button>
          );
        })}
      </div>
    </div>
  );
};

interface GeminiPromptGuideProps {
  selectedPrompts: string[];
  onPromptToggle: (prompt: string) => void;
}

export const GeminiPromptGuide: React.FC<GeminiPromptGuideProps> = ({ selectedPrompts, onPromptToggle }) => {
  const [activeCategory, setActiveCategory] = useState<string>(geminiQuickPrompts[0].category);

  const activePrompts = geminiQuickPrompts.find(c => c.category === activeCategory)?.prompts || [];

  return (
    <div className="w-full bg-gray-800/50 border border-gray-700 rounded-lg p-3 flex flex-col gap-3 animate-fade-in backdrop-blur-sm mb-4">
      <div className="flex items-center gap-2 overflow-x-auto pb-2 -mb-2" style={{ scrollbarWidth: 'thin' }}>
        {geminiQuickPrompts.map(({ category }) => (
          <button
            key={category}
            onClick={() => setActiveCategory(category)}
            className={`flex-shrink-0 font-semibold py-2 px-4 rounded-md transition-all duration-200 text-sm whitespace-nowrap ${
              activeCategory === category
              ? 'bg-white/10 text-white'
              : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            {category}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
        {activePrompts.map(({ name, prompt }) => {
          const isSelected = selectedPrompts.includes(prompt);
          return (
            <button
              key={name}
              onClick={() => onPromptToggle(prompt)}
              className={`text-center font-medium py-2 px-3 rounded-md transition-all duration-200 ease-in-out active:scale-95 text-xs h-full border ${
                isSelected
                  ? 'bg-blue-600 text-white border-blue-500 hover:bg-blue-500'
                  : 'bg-white/5 border-transparent text-gray-300 hover:bg-white/10 hover:border-white/10'
              }`}
              title={`Use prompt: "${prompt}"`}
            >
              {name}
            </button>
          );
        })}
      </div>
    </div>
  );
};
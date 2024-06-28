import React from 'react'
import { View, Text, SectionList } from 'react-native'
import { Meta, StoryObj } from '@storybook/react'
import { styled } from 'nativewind'

const meta: Meta = {
  title: 'UI System',
  component: View,
  decorators: [
    Story => (
      <View className="flex-1 justify-center">
        <Story />
      </View>
    ),
  ],
}

export default meta

type Story = StoryObj<{}>

const typographyVariants = [
  {
    title: 'Headings',
    data: [
      {
        style: 'text-2xl font-bold',
        title: 'Large',
      },
      {
        style: 'text-lg font-bold',
        title: 'Medium',
      },
      {
        style: 'text-base font-bold',
        title: 'Small',
      },
    ],
  },
  {
    title: 'Paragraphs Regular',
    data: [
      {
        style: 'text-base',
        title: 'Large',
      },
      {
        style: 'text-sm',
        title: 'Medium',
      },
      {
        style: 'text-xs',
        title: 'Small',
      },
      {
        style: 'text-[10px]',
        title: 'Extra Small',
      },
    ],
  },
  {
    title: 'Paragraphs Bold',
    data: [
      {
        style: 'text-base font-medium',
        title: 'Large',
      },
      {
        style: 'text-sm font-medium',
        title: 'Medium',
      },
      {
        style: 'text-xs font-medium',
        title: 'Small',
      },
      {
        style: 'text-[10px] font-medium',
        title: 'Extra Small',
      },
    ],
  },
]

type TextData = {
  style: string
  title: string
}

type TypographyData = {
  title: string
  data: TextData[]
}

const StyledSectionList = styled(SectionList<TextData, TypographyData>, {
  props: {
    contentContainerStyle: true,
  },
})

export const Typography: Story = {
  render: () => (
    <StyledSectionList
      sections={typographyVariants}
      keyExtractor={(el, idx) => el.title + idx}
      contentContainerStyle="p-4"
      ItemSeparatorComponent={() => <View className="h-4" />}
      stickySectionHeadersEnabled={false}
      renderSectionHeader={({ section: { title } }) => (
        <Text className="py-4 text-2xl">{title}</Text>
      )}
      renderItem={({ item }) => (
        <View>
          <Text>{item.title}</Text>
          <Text className={item.style}>Lorem ipsum dolor sit amet.</Text>
        </View>
      )}
    />
  ),
}

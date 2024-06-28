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

type ColorsSectionData = {
  title: string
  data: ColorData[]
}

type ColorData = {
  color: string
  textColor: string
  title: string
}

const colors = [
  {
    title: 'Primary',
    data: [
      {
        color: 'bg-primary-600',
        textColor: 'text-white',
        title: 'Primary-600',
      },
      {
        color: 'bg-primary-500',
        textColor: 'text-white',
        title: 'Primary-500',
      },
    ],
  },
  {
    title: 'Red',
    data: [
      {
        color: 'bg-red-600',
        textColor: 'text-white',
        title: 'Red-600',
      },
      {
        color: 'bg-red-500',
        textColor: 'text-white',
        title: 'Red-500',
      },
      {
        color: 'bg-red-50',
        textColor: 'text-black',
        title: 'Red-50',
      },
    ],
  },
  {
    title: 'Blue',
    data: [
      {
        color: 'bg-blue-600',
        textColor: 'text-white',
        title: 'Blue-600',
      },
      {
        color: 'bg-blue-500',
        textColor: 'text-white',
        title: 'Blue-500',
      },
      {
        color: 'bg-blue-50',
        textColor: 'text-black',
        title: 'Blue-50',
      },
    ],
  },
  {
    title: 'Purple',
    data: [
      {
        color: 'bg-primary-50',
        textColor: 'text-black',
        title: 'Purple-50',
      },
    ],
  },
  {
    title: 'Green',
    data: [
      {
        color: 'bg-green-600',
        textColor: 'text-white',
        title: 'Green-600',
      },
      {
        color: 'bg-green-500',
        textColor: 'text-white',
        title: 'Green-500',
      },
      {
        color: 'bg-green-50',
        textColor: 'text-black',
        title: 'Green-50',
      },
    ],
  },
  {
    title: 'Yellow',
    data: [
      {
        color: 'bg-yellow-600',
        textColor: 'text-white',
        title: 'Yellow-600',
      },
      {
        color: 'bg-yellow-500',
        textColor: 'text-white',
        title: 'Yellow-500',
      },
      {
        color: 'bg-yellow-50',
        textColor: 'text-black',
        title: 'Yellow-50',
      },
    ],
  },
  {
    title: 'Gray',
    data: [
      {
        color: 'bg-gray-900',
        textColor: 'text-white',
        title: 'Gray-900',
      },
      {
        color: 'bg-gray-800',
        textColor: 'text-white',
        title: 'Gray-800',
      },
      {
        color: 'bg-gray-700',
        textColor: 'text-white',
        title: 'Gray-700',
      },
      {
        color: 'bg-gray-600',
        textColor: 'text-white',
        title: 'Gray-600',
      },
      {
        color: 'bg-gray-500',
        textColor: 'text-white',
        title: 'Gray-500',
      },
      {
        color: 'bg-gray-400',
        textColor: 'text-white',
        title: 'Gray-400',
      },
      {
        color: 'bg-gray-300',
        textColor: 'text-black',
        title: 'Gray-300',
      },
      {
        color: 'bg-gray-200',
        textColor: 'text-black',
        title: 'Gray-200',
      },
      {
        color: 'bg-gray-100',
        textColor: 'text-black',
        title: 'Gray-100',
      },
      {
        color: 'bg-gray-50',
        textColor: 'text-black',
        title: 'Gray-50',
      },
      {
        color: 'bg-gray-25',
        textColor: 'text-black',
        title: 'Gray-25',
      },
    ],
  },
]

const StyledSectionList = styled(SectionList<ColorData, ColorsSectionData>, {
  props: {
    contentContainerStyle: true,
  },
})

export const Colors: Story = {
  render: () => (
    <StyledSectionList
      sections={colors}
      keyExtractor={(el, idx) => el.color + idx}
      contentContainerStyle="p-4"
      ItemSeparatorComponent={() => <View className="h-4" />}
      stickySectionHeadersEnabled={false}
      renderSectionHeader={({ section: { title } }) => (
        <Text className="py-4 text-2xl">{title}</Text>
      )}
      renderItem={({ item }) => (
        <View
          className={`h-16 justify-center items-center rounded-lg ${item.color}`}
        >
          <Text className={`text-xl ${item.textColor}`}>{item.title}</Text>
        </View>
      )}
    />
  ),
}

export const Typography: Story = {
  render: () => (
    <View>
      <Text>Colors</Text>
    </View>
  ),
}

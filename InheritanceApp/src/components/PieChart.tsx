import React from 'react';
import { View } from 'react-native';
import Svg, { G, Path } from 'react-native-svg';

interface PieData {
  name: string;
  amount: number;
  color: string;
  legendFontColor?: string;
  legendFontSize?: number;
}

interface PieChartProps {
  data: PieData[];
  width: number;
  height: number;
  accessor: string;
  backgroundColor?: string;
  paddingLeft?: string;
  absolute?: boolean;
}

const PieChart: React.FC<PieChartProps> = ({ data, width, height, accessor }) => {
  const total = data.reduce((sum, item) => sum + (item as any)[accessor], 0);
  if (total === 0) return null;

  const cx = width / 2;
  const cy = height / 2;
  const radius = Math.min(cx, cy) - 10;

  const slices = data.reduce<{ path: string; color: string; key: string; endAngle: number }[]>((acc, item, i) => {
    const value = (item as any)[accessor];
    const sliceAngle = (value / total) * 2 * Math.PI;
    const prevAngle = i === 0 ? -Math.PI / 2 : acc[i - 1].endAngle;
    const startAngle = prevAngle;
    const endAngle = startAngle + sliceAngle;

    const x1 = cx + radius * Math.cos(startAngle);
    const y1 = cy + radius * Math.sin(startAngle);
    const x2 = cx + radius * Math.cos(endAngle);
    const y2 = cy + radius * Math.sin(endAngle);
    const largeArcFlag = sliceAngle > Math.PI ? 1 : 0;

    const pathData = [
      `M ${cx} ${cy}`,
      `L ${x1} ${y1}`,
      `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
      'Z',
    ].join(' ');

    acc.push({ path: pathData, color: item.color, key: item.name, endAngle });
    return acc;
  }, []);

  return (
    <View style={{ alignItems: 'center' }}>
      <Svg width={width} height={height}>
        <G>
          {slices.map((slice) => (
            <Path key={slice.key} d={slice.path} fill={slice.color} />
          ))}
        </G>
      </Svg>
    </View>
  );
};

export default PieChart;

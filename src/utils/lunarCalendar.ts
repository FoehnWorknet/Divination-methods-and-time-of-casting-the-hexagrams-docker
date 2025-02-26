interface LunarApiResponse {
  code: number;
  msg: string;
  result: {
    gregoriandate: string;
    lunardate: string;
    tiangandizhiyear: string;
    tiangandizhimonth: string;
    tiangandizhiday: string;
    lubarmonth: string;  // 注意这里是 lubarmonth 而不是 lunarmonth
    lunarday: string;
    [key: string]: string;
  };
}

interface LunarInfo {
  yearHeavenlyStem: string;
  yearEarthlyBranch: string;
  monthHeavenlyStem: string;
  monthEarthlyBranch: string;
  dayHeavenlyStem: string;
  dayEarthlyBranch: string;
  hourHeavenlyStem: string;
  hourEarthlyBranch: string;
  lunarMonth: string;
  lunarDay: string;
  error?: string;
}

// 时辰转换
export function getEarthlyBranchHour(hour: number): string {
  if (hour >= 23 || hour < 1) return '子';
  if (hour < 3) return '丑';
  if (hour < 5) return '寅';
  if (hour < 7) return '卯';
  if (hour < 9) return '辰';
  if (hour < 11) return '巳';
  if (hour < 13) return '午';
  if (hour < 15) return '未';
  if (hour < 17) return '申';
  if (hour < 19) return '酉';
  if (hour < 21) return '戌';
  return '亥';
}

// 根据日干和时辰获取时干
function getHourHeavenlyStem(dayHeavenlyStem: string, hourEarthlyBranch: string): string {
  const heavenlyStemOrder = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
  const earthlyBranchOrder = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
  
  const startingStemMap: { [key: string]: string } = {
    '甲': '甲', '己': '甲',
    '乙': '丙', '庚': '丙',
    '丙': '戊', '辛': '戊',
    '丁': '庚', '壬': '庚',
    '戊': '壬', '癸': '壬'
  };

  const startingStem = startingStemMap[dayHeavenlyStem];
  const startingStemIndex = heavenlyStemOrder.indexOf(startingStem);
  const hourBranchIndex = earthlyBranchOrder.indexOf(hourEarthlyBranch);
  
  const hourStemIndex = (startingStemIndex + hourBranchIndex) % 10;
  return heavenlyStemOrder[hourStemIndex];
}

// 处理农历数字转换
function parseLunarNumber(str: string): string {
  if (!str) return '0';

  const numMap: { [key: string]: string } = {
    '一': '1', '二': '2', '三': '3', '四': '4', '五': '5',
    '六': '6', '七': '7', '八': '8', '九': '9', '十': '10',
    '正': '1', '腊': '12', '冬': '11'
  };

  // 处理纯数字的情况
  if (/^\d+$/.test(str)) {
    return str;
  }

  // 移除所有非数字的字符
  let result = str.replace(/[月初十廿]/g, '');
  
  // 如果结果是空的，尝试将中文数字转换为阿拉伯数字
  if (!result) {
    for (const [cn, num] of Object.entries(numMap)) {
      if (str.includes(cn)) {
        result = num;
        break;
      }
    }
  }

  // 处理特殊情况
  if (str.includes('廿')) {
    const units = str.match(/[一二三四五六七八九]$/);
    result = units ? `2${numMap[units[0]]}` : '20';
  } else if (str.includes('十')) {
    if (str === '十') {
      result = '10';
    } else {
      const before = str.match(/^[一二三四五六七八九]/)?.[0];
      const after = str.match(/[一二三四五六七八九]$/)?.[0];
      if (before && after) {
        result = `${numMap[before]}${numMap[after]}`;
      } else if (before) {
        result = `${numMap[before]}0`;
      } else if (after) {
        result = `1${numMap[after]}`;
      }
    }
  }

  return result || '0';
}

export async function getLunarDate(date: Date): Promise<LunarInfo> {
  try {
    // 格式化日期为 YYYY-MM-DD
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const formattedDate = `${year}-${month}-${day}`;

    // 构建 URL 查询参数
    const params = new URLSearchParams({
      key: '',
      date: formattedDate
    });

    const response = await fetch(`https://apis.tianapi.com/lunar/index?${params.toString()}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`API请求失败: ${response.status} ${response.statusText}`);
    }

    const data: LunarApiResponse = await response.json();

    if (data.code !== 200 || !data.result) {
      throw new Error(data.msg || 'API返回数据缺失');
    }

    // 从 lunardate 字段解析农历月日
    // 格式示例: "2025-1-16"
    const lunarDateParts = data.result.lunardate.split('-');
    const lunarMonth = lunarDateParts[1] || '0';
    const lunarDay = lunarDateParts[2] || '0';

    // 获取年月日的天干地支
    const yearGanZhi = data.result.tiangandizhiyear;
    const monthGanZhi = data.result.tiangandizhimonth;
    const dayGanZhi = data.result.tiangandizhiday;

    // 获取时辰地支
    const hourEarthlyBranch = getEarthlyBranchHour(date.getHours());
    
    // 获取时辰天干
    const hourHeavenlyStem = getHourHeavenlyStem(dayGanZhi[0], hourEarthlyBranch);

    // 验证数据完整性
    if (!yearGanZhi || !monthGanZhi || !dayGanZhi) {
      throw new Error('天干地支数据缺失');
    }

    if (!lunarMonth || !lunarDay || lunarMonth === '0' || lunarDay === '0') {
      throw new Error('农历日期转换失败');
    }

    return {
      yearHeavenlyStem: yearGanZhi[0],
      yearEarthlyBranch: yearGanZhi[1],
      monthHeavenlyStem: monthGanZhi[0],
      monthEarthlyBranch: monthGanZhi[1],
      dayHeavenlyStem: dayGanZhi[0],
      dayEarthlyBranch: dayGanZhi[1],
      hourHeavenlyStem,
      hourEarthlyBranch,
      lunarMonth,
      lunarDay
    };
  } catch (error) {
    console.error('获取农历日期出错:', error);
    return {
      yearHeavenlyStem: '－',
      yearEarthlyBranch: '－',
      monthHeavenlyStem: '－',
      monthEarthlyBranch: '－',
      dayHeavenlyStem: '－',
      dayEarthlyBranch: '－',
      hourHeavenlyStem: '－',
      hourEarthlyBranch: '－',
      lunarMonth: '0',
      lunarDay: '0',
      error: error instanceof Error ? error.message : '获取农历日期失败'
    };
  }
}

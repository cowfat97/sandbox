import type { WarEvent, StatsData } from '@/types'

// 模拟事件数据
export const mockEvents: WarEvent[] = [
  {
    id: 1,
    title: '俄乌边境军事冲突',
    country: '乌克兰',
    locationName: '顿涅茨克',
    latitude: 48.0159,
    longitude: 37.8028,
    eventType: 'military_conflict',
    severity: 4,
    source: 'NewsAPI',
    sourceUrl: 'https://example.com/1',
    eventDate: '2024-01-15',
    status: 'processed',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
    summary: '俄乌冲突持续升级，顿涅茨克地区成为主要战场。双方在阿夫杰耶夫卡方向展开激烈争夺，俄军持续推进。乌克兰方面呼吁西方增加军事援助，冲突造成大量平民伤亡和人道主义危机。',
    perspectives: [
      { name: '乌克兰', latitude: 48.0, longitude: 37.5, zoom: 6, summary: '【乌克兰视角】俄军持续进攻顿涅茨克地区，乌军顽强抵抗。乌克兰总统呼吁国际社会提供更多军事援助，称俄军侵略造成大量平民伤亡。乌克兰方面强调保卫领土完整的决心，呼吁西方国家加大对俄制裁力度。' },
      { name: '俄罗斯', latitude: 55.75, longitude: 37.6, zoom: 4, summary: '【俄罗斯视角】俄军在顿涅茨克方向推进顺利，解放被占领地区。俄罗斯国防部称行动旨在保护当地居民安全，打击乌克兰民族主义武装。俄方强调行动的合法性和必要性，指责西方国家干预地区事务。' }
    ]
  },
  {
    id: 2,
    title: '美伊以三方冲突',
    country: '伊朗',
    locationName: '德黑兰',
    latitude: 35.6892,
    longitude: 51.3890,
    eventType: 'military_conflict',
    severity: 5,
    source: 'NewsAPI',
    sourceUrl: 'https://example.com/2',
    eventDate: '2024-01-14',
    status: 'processed',
    createdAt: '2024-01-14T08:00:00Z',
    updatedAt: '2024-01-14T08:00:00Z',
    summary: '中东局势紧张升级，美国、以色列与伊朗之间的对抗加剧。伊朗核设施遭到网络攻击，以色列指责伊朗支持地区武装组织。美国向中东增派航母战斗群，三方关系跌至冰点，地区战争风险上升。',
    perspectives: [
      { name: '美国', latitude: 38.9, longitude: -77.0, zoom: 4, summary: '【美国视角】美国向中东增派航母战斗群，展示对盟友以色列的支持。美方称伊朗核活动威胁地区安全，呼吁国际社会共同遏制伊朗扩张。美国强调维护中东稳定的重要性，将继续对伊朗实施制裁。' },
      { name: '以色列', latitude: 31.8, longitude: 35.0, zoom: 5, summary: '【以色列视角】伊朗支持的武装组织对以色列安全构成严重威胁。以色列谴责伊朗核活动和对地区武装的资助，呼吁国际社会采取行动。以色列强调自卫权利，将采取必要措施保护国家安全。' },
      { name: '伊朗', latitude: 35.7, longitude: 51.4, zoom: 5, summary: '【伊朗视角】伊朗核活动完全用于和平目的，符合国际法。伊朗指责美国和以色列对地区造成动荡，称西方制裁是不公正的。伊朗强调有权发展核技术用于能源和医疗用途，呼吁解除制裁。' }
    ]
  },
  {
    id: 3,
    title: '边境武装摩擦',
    country: '印度',
    locationName: '拉达克地区',
    latitude: 34.5,
    longitude: 77.5,
    eventType: 'border_clash',
    severity: 2,
    source: 'NewsAPI',
    sourceUrl: 'https://example.com/3',
    eventDate: '2024-01-13',
    status: 'processed',
    createdAt: '2024-01-13T06:00:00Z',
    updatedAt: '2024-01-13T06:00:00Z',
    summary: '印巴边境拉达克地区发生小规模武装摩擦，双方巡逻队在争议地区遭遇并交火。印方称巴方率先越界，巴方则予以否认。双方已展开外交磋商，局势暂时可控。',
    perspectives: [
      { name: '印度', latitude: 34.5, longitude: 77.5, zoom: 6, summary: '【印度视角】巴基斯坦巡逻队越境挑衅，印度军队被迫自卫反击。印度呼吁巴基斯坦遵守边境协议，停止支持越境活动。印方强调维护边境安全的决心，将通过外交途径解决争端。' },
      { name: '巴基斯坦', latitude: 33.7, longitude: 73.0, zoom: 6, summary: '【巴基斯坦视角】印度军队无端攻击巴基斯坦巡逻人员，违反边境协议。巴基斯坦谴责印度的侵略行为，呼吁国际社会介入调查。巴方强调维护边境和平的意愿，要求印度停止挑衅行为。' }
    ]
  },
  {
    id: 4,
    title: '叙利亚内战持续',
    country: '叙利亚',
    locationName: '大马士革',
    latitude: 33.5138,
    longitude: 36.2765,
    eventType: 'military_conflict',
    severity: 4,
    source: 'ACLED',
    sourceUrl: 'https://example.com/4',
    eventDate: '2024-01-12',
    status: 'processed',
    createdAt: '2024-01-12T12:00:00Z',
    updatedAt: '2024-01-12T12:00:00Z',
    summary: '叙利亚内战进入第13年，政府军与反对派武装在伊德利卜省持续交战。土耳其支持的武装力量与库尔德武装在北部地区发生冲突，平民持续遭受苦难，数百万人流离失所。',
    perspectives: [
      { name: '叙利亚', latitude: 33.5, longitude: 36.3, zoom: 6, summary: '【叙利亚政府视角】政府军持续推进，打击恐怖组织和反对派武装。叙利亚呼吁国际社会停止对反对派的资助，尊重叙利亚主权。政府强调恢复国家稳定的重要性，将继续打击恐怖主义。' }
    ]
  },
  {
    id: 5,
    title: '非洲地区武装冲突',
    country: '苏丹',
    locationName: '喀土穆',
    latitude: 15.5527,
    longitude: 32.5324,
    eventType: 'military_conflict',
    severity: 5,
    source: 'ACLED',
    sourceUrl: 'https://example.com/5',
    eventDate: '2024-01-10',
    status: 'processed',
    createdAt: '2024-01-10T09:00:00Z',
    updatedAt: '2024-01-10T09:00:00Z',
    summary: '苏丹武装部队与快速支援部队在首都喀土穆爆发激烈战斗，已造成数千人死亡。医院遭到轰炸，基础设施严重受损，超过700万人被迫逃离家园。国际社会呼吁双方停火谈判。',
    perspectives: [
      { name: '苏丹', latitude: 15.5, longitude: 32.5, zoom: 6, summary: '【苏丹政府视角】政府军致力于恢复国家秩序，打击叛乱武装。苏丹呼吁国际社会提供人道主义援助，帮助重建基础设施。政府强调保护平民安全，呼吁各方停火谈判。' }
    ]
  }
]

// 模拟统计数据
export const mockStats: StatsData = {
  totalCount: mockEvents.length,
  weeklyCount: 5,
  hotRegions: [
    { name: '乌克兰', count: 1 },
    { name: '伊朗', count: 1 },
    { name: '苏丹', count: 1 },
    { name: '叙利亚', count: 1 },
    { name: '印度', count: 1 }
  ],
  byType: [
    { type: 'military_conflict', count: 4 },
    { type: 'border_clash', count: 1 },
    { type: 'terrorist_attack', count: 0 },
    { type: 'political_unrest', count: 0 },
    { type: 'other', count: 0 }
  ],
  bySeverity: [
    { severity: 5, count: 2 },
    { severity: 4, count: 2 },
    { severity: 3, count: 0 },
    { severity: 2, count: 1 },
    { severity: 1, count: 0 }
  ]
}
export type Vehicle = {
  id: string;
  model: string;
  year: string;
  location: string;
  plate: string;
  chassis: string;
  imageUrl: string;
  imageAlt: string;
  gallery: string[];
  status: 'Em análise' | 'Arrematado';
  risk: 'Risco Baixo' | 'Risco Médio';
  fipe: string;
  targetLabel: 'Lance sugerido' | 'Lucro Estimado';
  targetValue: string;
  estimatedProfit: string;
  estimatedExpenses: string;
  auction: string;
  notes: string;
};

export const vehicles: Vehicle[] = [
  {
    id: 'toyota-corolla-xei',
    model: 'Toyota Corolla XEi',
    year: '2021/2022',
    location: 'São Paulo, SP',
    plate: 'ABC-1234',
    chassis: '9BRB33BE3N0123456',
    imageUrl: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=900&q=80',
    imageAlt: 'Toyota Corolla XEi prata em garagem',
    gallery: [
      'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=1100&q=80',
      'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1100&q=80',
      'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=1100&q=80',
    ],
    status: 'Em análise',
    risk: 'Risco Baixo',
    fipe: 'R$ 135.000',
    targetLabel: 'Lance sugerido',
    targetValue: 'R$ 98.500',
    estimatedProfit: 'R$ 18.400',
    estimatedExpenses: 'R$ 7.800',
    auction: 'Sodré Santoro',
    notes: 'Boa margem estimada para lance, considerando reparos leves e documentação regular.',
  },
  {
    id: 'jeep-compass-longitude',
    model: 'Jeep Compass Longitude',
    year: '2020/2021',
    location: 'Rio de Janeiro, RJ',
    plate: 'XYZ-9876',
    chassis: '98867512MKJ987654',
    imageUrl: 'https://images.unsplash.com/photo-1535732820275-9ffd998cac22?auto=format&fit=crop&w=900&q=80',
    imageAlt: 'Jeep Compass Longitude branco',
    gallery: [
      'https://images.unsplash.com/photo-1535732820275-9ffd998cac22?auto=format&fit=crop&w=1100&q=80',
      'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?auto=format&fit=crop&w=1100&q=80',
      'https://images.unsplash.com/photo-1549925862-990c3a4e10a5?auto=format&fit=crop&w=1100&q=80',
    ],
    status: 'Arrematado',
    risk: 'Risco Médio',
    fipe: 'R$ 142.000',
    targetLabel: 'Lucro Estimado',
    targetValue: 'R$ 115.000',
    estimatedProfit: 'R$ 21.000',
    estimatedExpenses: 'R$ 9.500',
    auction: 'VIP Leilões',
    notes: 'Veículo arrematado dentro da faixa recomendada, com lucro estimado após custos.',
  },
  {
    id: 'vw-nivus-highline',
    model: 'VW Nivus Highline',
    year: '2023',
    location: 'São Paulo, SP',
    plate: 'NIV-2023',
    chassis: '9BWDL45U8PT123456',
    imageUrl: 'https://images.unsplash.com/photo-1542362567-b07e54358753?auto=format&fit=crop&w=900&q=80',
    imageAlt: 'VW Nivus Highline branco',
    gallery: [
      'https://images.unsplash.com/photo-1542362567-b07e54358753?auto=format&fit=crop&w=1100&q=80',
      'https://images.unsplash.com/photo-1525609004556-c46c7d6cf023?auto=format&fit=crop&w=1100&q=80',
      'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=1100&q=80',
    ],
    status: 'Em análise',
    risk: 'Risco Baixo',
    fipe: 'R$ 125.000',
    targetLabel: 'Lance sugerido',
    targetValue: 'R$ 92.000',
    estimatedProfit: 'R$ 20.500',
    estimatedExpenses: 'R$ 6.300',
    auction: 'Copart Brasil',
    notes: 'Perfil conservador, bom potencial para revenda se o lance ficar abaixo do recomendado.',
  },
];

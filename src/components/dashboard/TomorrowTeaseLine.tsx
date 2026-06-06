interface TomorrowTeaseLineProps {
  text: string
  subdued?: boolean
}

const H = {
  muted: '#7A6E62',
  serif: "'Literata', 'Fraunces', Georgia, 'Times New Roman', serif",
}

export function TomorrowTeaseLine({ text, subdued = false }: TomorrowTeaseLineProps) {
  return (
    <p
      data-testid="dashboard-tomorrow-tease"
      style={{
        margin: subdued ? '0 0 32px' : '0 0 24px',
        padding: subdued ? '0 4px' : 0,
        fontFamily: H.serif,
        fontSize: subdued ? '15px' : '14px',
        fontStyle: 'italic',
        lineHeight: 1.55,
        color: H.muted,
        textAlign: subdued ? 'left' : 'left',
        opacity: subdued ? 0.92 : 0.88,
      }}
    >
      {text}
    </p>
  )
}

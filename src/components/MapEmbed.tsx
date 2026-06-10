interface MapEmbedProps {
  url: string
}

export function MapEmbed({ url }: MapEmbedProps) {
  return (
    <div className="w-full rounded-xl overflow-hidden border-2 border-gray-700 shadow-lg">
      <iframe
        src={url}
        width="100%"
        height="250"
        style={{ border: 0 }}
        allowFullScreen
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        title="Ubicación de la fiesta"
      />
    </div>
  )
}

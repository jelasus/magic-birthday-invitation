/** The authentic Magic: The Gathering card back (exact reference image). */
export function CardBack() {
  return (
    <div
      role="img"
      aria-label="Reverso de la carta Magic: The Gathering"
      className="h-full w-full rounded-[14px] bg-cover bg-center"
      style={{ backgroundImage: 'url(/images/card-back.jpg)' }}
    />
  )
}

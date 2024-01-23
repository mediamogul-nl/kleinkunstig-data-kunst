// import textureUrl from "/bgimgs/cute.jpg"

function Background() {
  const texture = useTexture(textureUrl)
  texture.wrapS = THREE.RepeatWrapping
  texture.wrapT = THREE.RepeatWrapping
  texture.repeat.set(2, 2)
  return (
    <mesh rotation={[1.7, 0, -3]} scale={100}>
      <sphereGeometry />
      <meshBasicMaterial map={texture} depthTest={false} side={THREE.BackSide} />
    </mesh>
  )
}

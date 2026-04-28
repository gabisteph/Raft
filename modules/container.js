import * as THREE from 'three';

export function createShipContainers(ship, deckHeight) {
    const TOTAL_CONTAINERS = 24;

    const shipContainers = [];

    const shipCols = 4;
    const shipRows = 4;
    const shipLevels = 3;

    const spacingX = 3.6;
    const spacingZ = 1.18;
    const spacingY = 1.3;

    const containerWidth = 2.6;
    const containerHeight = 1.13;
    const containerDepth = 1.06;

    const offsetX = -((shipCols - 1) * spacingX) / 2;
    const offsetZ = -((shipRows - 1) * spacingZ) / 2;
    const baseY = deckHeight + 1;

    /*
      LAYOUT DOS CONTAINERS
    */
    const shipLayout = [
        [
            [null, "B", "P", "P"],
            [null, "B", "P", null],
            [null, "P", "P", "P"],
            ["P", "P", "B", null]
        ],
        [
            [null, "B", "P", null],
            [null, "B", "P", null],
            [null, "B", "B", "B"],
            ["B", "B", "B", null]
        ],
        [
            [null, null, null, null],
            [null, null, "P", null],
            [null, "B", "B", null],
            [null, null, null, null]
        ]
    ];

    /*
      MATERIAL BASE
    */
    function createContainerMaterial(color) {
        return new THREE.MeshStandardMaterial({
            color,
            roughness: 0.9,
            metalness: 0.08
        });
    }

    /*
      BORDAS VISÍVEIS
    */
    function addContainerLines(box) {
        const edges = new THREE.EdgesGeometry(box.geometry);

        const line = new THREE.LineSegments(
            edges,
            new THREE.LineBasicMaterial({
                color: 0x2a2a2a
            })
        );

        box.add(line);
    }

    /*
      RANHURAS VERTICAIS
    */
    function addRibs(box) {
        const ribMaterial = new THREE.MeshStandardMaterial({
            color: 0x2f2f2f,
            roughness: 1
        });

        const ribCount = 10;

        for (let i = 1; i < ribCount; i++) {
            const rib = new THREE.Mesh(
                new THREE.BoxGeometry(
                    0.05,
                    containerHeight,
                    containerDepth + 0.03
                ),
                ribMaterial
            );

            rib.position.x =
                -containerWidth / 2 + (i * containerWidth) / ribCount;

            box.add(rib);
        }
    }

    /*
      CANTOS REFORÇADOS
    */
    function addRustDetails(box) {
        const rustMaterial = new THREE.MeshStandardMaterial({
            color: 0x5a3b2e,
            roughness: 1
        });

        const corners = [
            [-1, -1],
            [1, -1],
            [-1, 1],
            [1, 1]
        ];

        corners.forEach(([x, z]) => {
            const rust = new THREE.Mesh(
                new THREE.BoxGeometry(
                    0.12,
                    containerHeight + 0.02,
                    0.12
                ),
                rustMaterial
            );

            rust.position.set(
                x * (containerWidth / 2),
                0,
                z * (containerDepth / 2)
            );

            box.add(rust);
        });
    }

    /*
SUBSTITUA apenas a função addContainerDoors(box, containerColor)

Agora as portas ficam na FRENTE do container
(viradas para os botos), ou seja, no lado -X
em vez de +X.
*/

function addContainerDoors(box, containerColor) {
    const doorMaterial = new THREE.MeshStandardMaterial({
        color: containerColor,
        roughness: 0.92,
        metalness: 0.04
    });

    const lockMaterial = new THREE.MeshStandardMaterial({
        color: 0xb8b8b8,
        roughness: 0.4,
        metalness: 0.85
    });

    /*
      PORTA ESQUERDA
      agora na frente real do container (-X)
    */
    const leftDoor = new THREE.Mesh(
        new THREE.BoxGeometry(
            0.025,
            containerHeight * 0.90,
            containerDepth * 0.46
        ),
        doorMaterial
    );

    leftDoor.position.set(
        -containerWidth / 2 - 0.015,
        0,
        -containerDepth * 0.24
    );

    box.add(leftDoor);

    /*
      PORTA DIREITA
    */
    const rightDoor = new THREE.Mesh(
        new THREE.BoxGeometry(
            0.025,
            containerHeight * 0.90,
            containerDepth * 0.46
        ),
        doorMaterial
    );

    rightDoor.position.set(
        -containerWidth / 2 - 0.015,
        0,
        containerDepth * 0.24
    );

    box.add(rightDoor);

    /*
      4 BARRAS VERTICAIS
    */
    const lockPositions = [-0.35, -0.12, 0.12, 0.35];

    lockPositions.forEach((zPos) => {
        const bar = new THREE.Mesh(
            new THREE.BoxGeometry(
                0.035,
                containerHeight * 0.82,
                0.025
            ),
            lockMaterial
        );

        bar.position.set(
            -containerWidth / 2 - 0.03,
            0,
            containerDepth * zPos
        );

        box.add(bar);

        /*
          trava superior
        */
        const topHandle = new THREE.Mesh(
            new THREE.BoxGeometry(
                0.03,
                0.025,
                0.10
            ),
            lockMaterial
        );

        topHandle.position.set(
            -containerWidth / 2 - 0.04,
            containerHeight * 0.30,
            containerDepth * zPos
        );

        box.add(topHandle);

        /*
          trava inferior
        */
        const bottomHandle = new THREE.Mesh(
            new THREE.BoxGeometry(
                0.03,
                0.025,
                0.10
            ),
            lockMaterial
        );

        bottomHandle.position.set(
            -containerWidth / 2 - 0.04,
            -containerHeight * 0.30,
            containerDepth * zPos
        );

        box.add(bottomHandle);
    });
}

    let blueCount = 0;
    let pinkCount = 0;

    /*
      CRIAÇÃO DOS CONTAINERS
    */
    for (let level = 0; level < shipLevels; level++) {
        for (let row = 0; row < shipRows; row++) {
            for (let col = 0; col < shipCols; col++) {
                const code = shipLayout[level][row][col];

                if (!code) continue;

                const containerColor =
                    code === "B"
                        ? 0x7ec8ff // azul
                        : 0xff9acb; // rosa

                if (code === "B") blueCount++;
                if (code === "P") pinkCount++;

                const box = new THREE.Mesh(
                    new THREE.BoxGeometry(
                        containerWidth,
                        containerHeight,
                        containerDepth
                    ),
                    createContainerMaterial(containerColor)
                );

                addContainerLines(box);
                addRibs(box);
                addRustDetails(box);
                addContainerDoors(box, containerColor);

                box.position.set(
                    offsetX + col * spacingX,
                    baseY + level * spacingY,
                    offsetZ + row * spacingZ
                );

                box.castShadow = true;
                box.receiveShadow = true;

                box.userData.isUnloaded = false;
                box.userData.pierSlot = null;
                box.userData.isOnPier = false;
                box.userData.isCarriedByHuman = false;
                box.userData.isDelivered = false;
                box.userData.isOnRaft = false;

                ship.add(box);
                shipContainers.push(box);

                box.userData.containerId = shipContainers.length;
                box.userData.originalPosition = box.position.clone();
                box.userData.shipLevel = level;
                box.userData.shipRow = row;
                box.userData.shipCol = col;
                box.userData.colorCode = code;
            }
        }
    }

    /*
      VALIDAÇÕES
    */
    if (shipContainers.length !== TOTAL_CONTAINERS) {
        console.warn(
            `A matriz do barco tem ${shipContainers.length} containers, mas o TOTAL_CONTAINERS está em ${TOTAL_CONTAINERS}.`
        );
    }

    if (blueCount !== 12 || pinkCount !== 12) {
        console.warn(
            `Quantidade inválida: azul=${blueCount}, rosa=${pinkCount}`
        );
    }

    return {
        shipContainers,
        containerWidth
    };
}
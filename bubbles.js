export function createBubbleGrid(scene, bubbles) {
    const gridRows = 5; // Fixed number of rows
    const gridCols = 8; // Fixed number of columns
    const bubbleSize = 60; // Adjusted size of each bubble (smaller size)
    const bubbleGap = 10; // Gap between bubbles

    // Calculate xOffset and yOffset based on the new bubble size and gap
    const xOffset = 100; // Horizontal offset for grid
    const yOffset = 100; // Vertical offset for grid

    // Clear any existing bubbles
    bubbles.length = 0; // Clear the array

    // Create the bubble grid
    for (let row = 0; row < gridRows; row++) {
        for (let col = 0; col < gridCols; col++) {
            // Use bubbleSize plus the gap to calculate positions
            const x = xOffset + col * (bubbleSize + bubbleGap);
            const y = yOffset + row * (bubbleSize + bubbleGap);

            const bubble = scene.add.image(x, y, 'bubble').setInteractive();
            bubble.active = false; // Initially inactive
            bubble.setDisplaySize(bubbleSize, bubbleSize); // Set the bubble size
            bubbles.push(bubble);
        }
    }

    // Randomly activate some bubbles
    const bubblesToActivate = Math.ceil(gridRows * gridCols * 0.3); // Activate ~30%
    for (let i = 0; i < bubblesToActivate; i++) {
        const randomBubble = Phaser.Utils.Array.GetRandom(bubbles);
        randomBubble.setTexture('bubble_active'); // Set active texture
        randomBubble.active = true;
    }

    return bubbles;
}
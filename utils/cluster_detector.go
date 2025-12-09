package utils

type Position struct {
	Row int `json:"row"`
	Col int `json:"col"`
}

type Cluster struct {
	Symbol    string     `json:"symbol"`
	Positions []Position `json:"positions"`
	Size      int        `json:"size"`
}

// DetectClusters finds all winning clusters (3+ adjacent symbols) in a 6x5 grid
func DetectClusters(grid [][]string) []Cluster {
	rows := len(grid)
	if rows == 0 {
		return []Cluster{}
	}
	cols := len(grid[0])

	visited := make([][]bool, rows)
	for i := range visited {
		visited[i] = make([]bool, cols)
	}

	var clusters []Cluster

	for row := 0; row < rows; row++ {
		for col := 0; col < cols; col++ {
			if !visited[row][col] && grid[row][col] != "EMPTY" {
				cluster := floodFill(grid, visited, row, col)
				if cluster.Size >= 3 {
					clusters = append(clusters, cluster)
				}
			}
		}
	}

	return clusters
}

// floodFill uses BFS to find all connected symbols
func floodFill(grid [][]string, visited [][]bool, startRow, startCol int) Cluster {
	rows := len(grid)
	cols := len(grid[0])
	symbol := grid[startRow][startCol]

	cluster := Cluster{
		Symbol:    symbol,
		Positions: []Position{},
		Size:      0,
	}

	queue := []Position{{Row: startRow, Col: startCol}}
	visited[startRow][startCol] = true

	// Directions: up, down, left, right (no diagonals)
	directions := []Position{
		{Row: -1, Col: 0}, // up
		{Row: 1, Col: 0},  // down
		{Row: 0, Col: -1}, // left
		{Row: 0, Col: 1},  // right
	}

	for len(queue) > 0 {
		current := queue[0]
		queue = queue[1:]

		cluster.Positions = append(cluster.Positions, current)
		cluster.Size++

		// Check all 4 adjacent cells
		for _, dir := range directions {
			newRow := current.Row + dir.Row
			newCol := current.Col + dir.Col

			// Check bounds
			if newRow >= 0 && newRow < rows && newCol >= 0 && newCol < cols {
				// Check if not visited and same symbol
				if !visited[newRow][newCol] && grid[newRow][newCol] == symbol {
					visited[newRow][newCol] = true
					queue = append(queue, Position{Row: newRow, Col: newCol})
				}
			}
		}
	}

	return cluster
}

// RemoveClusterSymbols marks cluster positions as EMPTY
func RemoveClusterSymbols(grid [][]string, clusters []Cluster) [][]string {
	newGrid := make([][]string, len(grid))
	for i := range grid {
		newGrid[i] = make([]string, len(grid[i]))
		copy(newGrid[i], grid[i])
	}

	for _, cluster := range clusters {
		for _, pos := range cluster.Positions {
			newGrid[pos.Row][pos.Col] = "EMPTY"
		}
	}

	return newGrid
}

// ApplyGravity drops symbols down and fills empty spaces from top
func ApplyGravity(grid [][]string) [][]string {
	rows := len(grid)
	cols := len(grid[0])

	newGrid := make([][]string, rows)
	for i := range newGrid {
		newGrid[i] = make([]string, cols)
	}

	// Process each column
	for col := 0; col < cols; col++ {
		writeRow := rows - 1 // Start from bottom

		// First pass: drop existing symbols
		for row := rows - 1; row >= 0; row-- {
			if grid[row][col] != "EMPTY" {
				newGrid[writeRow][col] = grid[row][col]
				writeRow--
			}
		}

		// Second pass: fill remaining with EMPTY (will be filled by new symbols)
		for writeRow >= 0 {
			newGrid[writeRow][col] = "EMPTY"
			writeRow--
		}
	}

	return newGrid
}

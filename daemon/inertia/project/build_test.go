package project

import (
	"context"
	"os"
	"path"
	"strings"
	"testing"
	"time"

	"github.com/docker/docker/api/types"
	"github.com/docker/docker/api/types/filters"
	docker "github.com/docker/docker/client"
	"github.com/stretchr/testify/assert"
)

func cleanupContainers(cli *docker.Client) error {
	ctx := context.Background()
	containers, err := cli.ContainerList(ctx, types.ContainerListOptions{})
	if err != nil {
		return err
	}

	// Gracefully take down all containers except the testvps
	for _, container := range containers {
		if container.Names[0] != "/testvps" {
			timeout := 10 * time.Second
			err := cli.ContainerStop(ctx, container.ID, &timeout)
			if err != nil {
				return err
			}
		}
	}

	// Prune images
	_, err = cli.ContainersPrune(ctx, filters.Args{})
	return err
}

func TestDockerComposeIntegration(t *testing.T) {
	if testing.Short() {
		t.Skip("skipping integration test")
	}
	cli, err := docker.NewEnvClient()
	assert.Nil(t, err)
	defer cli.Close()

	testProjectDir := path.Join(
		os.Getenv("GOPATH"),
		"/src/github.com/ubclaunchpad/inertia/test/build/docker-compose",
	)
	testProjectName := "test_dockercompose"
	d := &Deployment{
		directory: testProjectDir,
		project:   testProjectName,
		buildType: "docker-compose",
	}
	err = cleanupContainers(cli)
	assert.Nil(t, err)

	// Execute build
	err = dockerCompose(d, cli, os.Stdout)
	assert.Nil(t, err)

	// Arbitrary wait for containers to start
	time.Sleep(10 * time.Second)

	containers, err := cli.ContainerList(
		context.Background(),
		types.ContainerListOptions{},
	)
	assert.Nil(t, err)
	foundDC := false
	foundP := false
	for _, c := range containers {
		if strings.Contains(c.Names[0], "docker-compose") {
			foundDC = true
		}
		if strings.Contains(c.Names[0], testProjectName) {
			foundP = true
		}
	}

	// try again if project no up (workaround for Travis)
	if !foundP {
		time.Sleep(10 * time.Second)
		containers, err = cli.ContainerList(
			context.Background(),
			types.ContainerListOptions{},
		)
		assert.Nil(t, err)
		for _, c := range containers {
			if strings.Contains(c.Names[0], testProjectName) {
				foundP = true
			}
		}
	}

	assert.True(t, foundDC, "docker-compose container should be active")
	assert.True(t, foundP, "project container should be active")

	err = cleanupContainers(cli)
	assert.Nil(t, err)
}

func TestDockerBuildIntegration(t *testing.T) {
	if testing.Short() {
		t.Skip("skipping integration test")
	}
	cli, err := docker.NewEnvClient()
	assert.Nil(t, err)
	defer cli.Close()

	testProjectDir := path.Join(
		os.Getenv("GOPATH"),
		"/src/github.com/ubclaunchpad/inertia/test/build/dockerfile",
	)
	testProjectName := "test_dockerfile"
	d := &Deployment{
		directory: testProjectDir,
		project:   testProjectName,
		buildType: "dockerfile",
	}
	err = cleanupContainers(cli)
	assert.Nil(t, err)

	// Execute build
	err = dockerBuild(d, cli, os.Stdout)
	assert.Nil(t, err)

	// Arbitrary wait for containers to start
	time.Sleep(5 * time.Second)

	containers, err := cli.ContainerList(
		context.Background(),
		types.ContainerListOptions{},
	)
	assert.Nil(t, err)
	foundP := false
	for _, c := range containers {
		if strings.Contains(c.Names[0], testProjectName) {
			foundP = true
		}
	}
	assert.True(t, foundP, "project container should be active")

	err = cleanupContainers(cli)
	assert.Nil(t, err)
}

func TestHerokuishBuildIntegration(t *testing.T) {
	if testing.Short() {
		t.Skip("skipping integration test")
	}
	cli, err := docker.NewEnvClient()
	assert.Nil(t, err)
	defer cli.Close()

	testProjectDir := path.Join(
		os.Getenv("GOPATH"),
		"/src/github.com/ubclaunchpad/inertia/test/build/herokuish",
	)
	testProjectName := "test_herokuish"
	d := &Deployment{
		directory: testProjectDir,
		project:   testProjectName,
		buildType: "herokuish",
	}
	err = cleanupContainers(cli)
	assert.Nil(t, err)

	// Execute build
	err = herokuishBuild(d, cli, os.Stdout)
	assert.Nil(t, err)

	// Arbitrary wait for containers to start
	time.Sleep(5 * time.Second)

	containers, err := cli.ContainerList(
		context.Background(),
		types.ContainerListOptions{},
	)
	assert.Nil(t, err)
	foundP := false
	for _, c := range containers {
		if strings.Contains(c.Names[0], testProjectName) {
			foundP = true
		}
	}
	assert.True(t, foundP, "project container should be active")

	err = cleanupContainers(cli)
	assert.Nil(t, err)
}
